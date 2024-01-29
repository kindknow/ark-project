import {
  Account,
  AccountInterface,
  BigNumberish,
  cairo,
  CairoOption,
  CairoOptionVariant,
  Uint256
} from "starknet";

import { Config } from "../../createConfig";
import { FulfillInfo, FulfillOfferInfo } from "../../types";
import { _fulfillOrder } from "./_fulfill";

/**
 * Fulfill an offer on the Arkchain.
 *
 * @param {Config} config - The core SDK configuration.
 * @param {FulfillOfferParameters} parameters - Parameters for fulfilling the offer.
 *
 * @returns {Promise<void>} A promise that resolves when the transaction is completed.
 */
interface FulfillOfferParameters {
  starknetAccount: AccountInterface;
  arkAccount: Account;
  fulfillOfferInfo: FulfillOfferInfo;
  owner?: string;
}

const fulfillOffer = async (
  config: Config,
  parameters: FulfillOfferParameters
) => {
  const { starknetAccount, arkAccount, fulfillOfferInfo, owner } = parameters;
  const chainId = await config.starknetProvider.getChainId();
  const fulfillInfo: FulfillInfo = {
    order_hash: fulfillOfferInfo.order_hash,
    related_order_hash: new CairoOption<BigNumberish>(CairoOptionVariant.None),
    fulfiller: starknetAccount.address,
    token_chain_id: chainId,
    token_address: fulfillOfferInfo.token_address,
    token_id: new CairoOption<Uint256>(
      CairoOptionVariant.Some,
      cairo.uint256(fulfillOfferInfo.token_id)
    )
  };

  _fulfillOrder(config, {
    starknetAccount,
    arkAccount,
    fulfillInfo,
    owner
  });
};

export { fulfillOffer };
