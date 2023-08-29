use crate::constants::BLACKLIST;
use ark_collection_update_lambda::update_additional_collection_data;
use ark_db::collection::create::create_collection;
use ark_db::contract::get::get_contract;
use ark_starknet::client::get_contract_type;
use ark_starknet::client2::StarknetClient;
use ark_stream::send::send_to_kinesis;
use ark_transfers::transfer::process_transfers;
use aws_sdk_dynamodb::Client as DynamoClient;
use aws_sdk_kinesis::Client as KinesisClient;
use log::{debug, error, info};
use reqwest::Client as ReqwestClient;
use serde_json::Value;
use starknet::core::types::EmittedEvent;
use starknet::providers::jsonrpc::HttpTransport;
use starknet::providers::JsonRpcClient;
use std::env;
use std::error::Error;
use std::time::Instant;

// Identifies contract types based on events from ABIs, checks for their presence in a Redis server, and if not found, calls contract methods to determine the type, stores this information back in Redis, and finally prints the contract type.
pub async fn identify_contract_types_from_transfers(
    _sn_client: &StarknetClient,
    rpc_client: &JsonRpcClient<HttpTransport>,
    client: &ReqwestClient,
    events: &[EmittedEvent],
    dynamo_client: &DynamoClient,
    kinesis_client: &KinesisClient,
) -> Result<(), Box<dyn Error>> {
    let is_dev = match env::var("IS_DEV") {
        Ok(val) => match val.to_lowercase().as_str() {
            "true" | "1" => true,
            "false" | "0" | "" => false,
            _ => panic!("IS_DEV must be set to true or false"),
        },
        Err(_) => panic!("IS_DEV must be set"),
    };
    // Get dynamo table to work with
    let collections_table =
        env::var("ARK_COLLECTIONS_TABLE_NAME").expect("ARK_COLLECTIONS_TABLE_NAME must be set");
    let kinesis_transfer_stream =
        env::var("KINESIS_TRANSFER_STREAM_NAME").expect("KINESIS_TRANSFER_STREAM_NAME must be set");

    let kinesis_collection_stream = env::var("KINESIS_COLLECTION_STREAM_NAME")
        .expect("KINESIS_COLLECTION_STREAM_NAME must be set");

    // Init start time
    let start_time = Instant::now();

    for event in events {
        let contract_address = format!("{:#064x}", &event.from_address);

        // Filter contract with most transactions from identification
        if BLACKLIST.contains(&contract_address.as_str()) {
            continue;
        }

        let block_number: u64 = event.block_number;

        // Check if contract present and type
        let contract_status = get_contract(dynamo_client, &contract_address)
            .await
            .unwrap_or(None);

        let event_json = serde_json::to_string(&event).expect("Event not convertible to JSON");

        if let Some(existing_contract_type) = contract_status {
            if existing_contract_type == "unknown" {
                continue; // If it's unknown, skip this iteration of the loop
            } else if existing_contract_type == "erc721" || existing_contract_type == "erc1155" {
                // TODO: use a common function
                if is_dev {
                    let _ = process_transfers(
                        client,
                        dynamo_client,
                        &event_json,
                        existing_contract_type.as_str(),
                    )
                    .await;
                } else {
                    let _ = send_to_kinesis(
                        kinesis_client,
                        kinesis_transfer_stream.as_str(),
                        "transfer",
                        &event_json,
                        existing_contract_type.as_str(),
                    )
                    .await;
                }

                continue; // After sending event, skip this iteration of the loop
            }
        }

        let contract_type = get_contract_type(client, &contract_address, block_number).await;

        debug!("contract_type: {:?}", contract_type);

        match create_collection(
            dynamo_client,
            &collections_table,
            &contract_address,
            &contract_type,
        )
        .await
        {
            Ok(success) => {
                info!(
                    "[Success] New collection item added successfully.\n\
                    - Item Details: {:?}\n\
                    - Table: {}",
                    success, &collections_table
                );

                if contract_type != "unknown" {
                    // TODO: use a common function
                    if is_dev {
                        process_transfers(
                            client,
                            dynamo_client,
                            &event_json,
                            contract_type.as_str(),
                        )
                        .await?;
                        update_additional_collection_data(
                            rpc_client,
                            client,
                            dynamo_client,
                            &contract_address,
                            block_number,
                        )
                        .await?;
                    } else {
                        let mut map = std::collections::HashMap::new();
                        map.insert("contract_address", Value::String(contract_address));
                        map.insert("block_number", Value::Number(block_number.into()));
                        let serialized_map = serde_json::to_string(&map).unwrap();
                        send_to_kinesis(
                            kinesis_client,
                            kinesis_collection_stream.as_str(),
                            "collection",
                            &serialized_map,
                            contract_type.as_str(),
                        )
                        .await
                        .unwrap();
                        send_to_kinesis(
                            kinesis_client,
                            kinesis_transfer_stream.as_str(),
                            "transfer",
                            &event_json,
                            contract_type.as_str(),
                        )
                        .await
                        .unwrap();
                    }
                }
            }
            Err(e) => {
                error!(
                    "[Error] Failed to add a new item to the collection.\n\
                    - Error Details: {:?}\n\
                    - Target Table: {}",
                    e, &collections_table
                );
            }
        }
    }
    let duration = start_time.elapsed();
    debug!("Time elapsed in contracts block is: {:?}", duration);

    Ok(())
}