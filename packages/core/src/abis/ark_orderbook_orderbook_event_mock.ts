/**
 * This file is autogenerated by
 * You should not edit it manually or your changes might be overwritten.
 */

export default [
  {
    type: "enum",
    name: "ark_common::protocol::order_types::OrderType",
    variants: [
      { name: "Listing", type: "()" },
      { name: "Auction", type: "()" },
      { name: "Offer", type: "()" },
      { name: "CollectionOffer", type: "()" }
    ]
  },
  {
    type: "enum",
    name: "core::option::Option::<core::felt252>",
    variants: [
      { name: "Some", type: "core::felt252" },
      { name: "None", type: "()" }
    ]
  },
  {
    type: "enum",
    name: "ark_common::protocol::order_types::RouteType",
    variants: [
      { name: "Erc20ToErc721", type: "()" },
      { name: "Erc721ToErc20", type: "()" }
    ]
  },
  {
    type: "struct",
    name: "core::integer::u256",
    members: [
      { name: "low", type: "core::integer::u128" },
      { name: "high", type: "core::integer::u128" }
    ]
  },
  {
    type: "enum",
    name: "core::option::Option::<core::integer::u256>",
    variants: [
      { name: "Some", type: "core::integer::u256" },
      { name: "None", type: "()" }
    ]
  },
  {
    type: "struct",
    name: "core::array::Span::<core::felt252>",
    members: [
      { name: "snapshot", type: "@core::array::Array::<core::felt252>" }
    ]
  },
  {
    type: "struct",
    name: "ark_common::protocol::order_v1::OrderV1",
    members: [
      { name: "route", type: "ark_common::protocol::order_types::RouteType" },
      {
        name: "currency_address",
        type: "core::starknet::contract_address::ContractAddress"
      },
      { name: "currency_chain_id", type: "core::felt252" },
      { name: "salt", type: "core::felt252" },
      {
        name: "offerer",
        type: "core::starknet::contract_address::ContractAddress"
      },
      { name: "token_chain_id", type: "core::felt252" },
      {
        name: "token_address",
        type: "core::starknet::contract_address::ContractAddress"
      },
      { name: "token_id", type: "core::option::Option::<core::integer::u256>" },
      { name: "quantity", type: "core::integer::u256" },
      { name: "start_amount", type: "core::integer::u256" },
      { name: "end_amount", type: "core::integer::u256" },
      { name: "start_date", type: "core::integer::u64" },
      { name: "end_date", type: "core::integer::u64" },
      {
        name: "broker_id",
        type: "core::starknet::contract_address::ContractAddress"
      },
      { name: "additional_data", type: "core::array::Span::<core::felt252>" }
    ]
  },
  {
    type: "event",
    name: "ark_orderbook::orderbook_event_mock::orderbook_event_mock::OrderPlaced",
    kind: "struct",
    members: [
      { name: "order_hash", type: "core::felt252", kind: "key" },
      { name: "order_version", type: "core::felt252", kind: "key" },
      {
        name: "order_type",
        type: "ark_common::protocol::order_types::OrderType",
        kind: "key"
      },
      {
        name: "cancelled_order_hash",
        type: "core::option::Option::<core::felt252>",
        kind: "data"
      },
      {
        name: "order",
        type: "ark_common::protocol::order_v1::OrderV1",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "ark_orderbook::orderbook_event_mock::orderbook_event_mock::OrderExecuted",
    kind: "struct",
    members: [{ name: "order_hash", type: "core::felt252", kind: "key" }]
  },
  {
    type: "event",
    name: "ark_orderbook::orderbook_event_mock::orderbook_event_mock::OrderCancelled",
    kind: "struct",
    members: [
      { name: "order_hash", type: "core::felt252", kind: "key" },
      { name: "reason", type: "core::felt252", kind: "key" }
    ]
  },
  {
    type: "event",
    name: "ark_orderbook::orderbook_event_mock::orderbook_event_mock::RollbackStatus",
    kind: "struct",
    members: [
      { name: "order_hash", type: "core::felt252", kind: "key" },
      { name: "reason", type: "core::felt252", kind: "key" }
    ]
  },
  {
    type: "event",
    name: "ark_orderbook::orderbook_event_mock::orderbook_event_mock::OrderFulfilled",
    kind: "struct",
    members: [
      { name: "order_hash", type: "core::felt252", kind: "key" },
      {
        name: "fulfiller",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "related_order_hash",
        type: "core::option::Option::<core::felt252>",
        kind: "key"
      }
    ]
  },
  {
    type: "event",
    name: "ark_orderbook::orderbook_event_mock::orderbook_event_mock::Event",
    kind: "enum",
    variants: [
      {
        name: "OrderPlaced",
        type: "ark_orderbook::orderbook_event_mock::orderbook_event_mock::OrderPlaced",
        kind: "nested"
      },
      {
        name: "OrderExecuted",
        type: "ark_orderbook::orderbook_event_mock::orderbook_event_mock::OrderExecuted",
        kind: "nested"
      },
      {
        name: "OrderCancelled",
        type: "ark_orderbook::orderbook_event_mock::orderbook_event_mock::OrderCancelled",
        kind: "nested"
      },
      {
        name: "RollbackStatus",
        type: "ark_orderbook::orderbook_event_mock::orderbook_event_mock::RollbackStatus",
        kind: "nested"
      },
      {
        name: "OrderFulfilled",
        type: "ark_orderbook::orderbook_event_mock::orderbook_event_mock::OrderFulfilled",
        kind: "nested"
      }
    ]
  }
] as const;