/**
 * Central configuration for the auction frontend.
 *
 * Everything network-specific lives here so the rest of the app never hard-codes
 * an RPC URL, explorer link or contract account.
 */

/** This frontend is intentionally locked to NEAR testnet (free, test-only NEAR tokens). */
export const NETWORK_ID = "testnet" as const;

/**
 * Account the auction contract is deployed to.
 *
 * Resolution order (first match wins):
 *   1. `?contract=<account>` in the page URL, so anyone can point the UI at their own deployment
 *      without rebuilding, e.g. http://localhost:5173/?contract=my-auction.testnet
 *   2. `VITE_CONTRACT_ID` from `frontend/.env` (see `.env.example`)
 *   3. The account this repo's contract is currently deployed to on testnet.
 */
export const CONTRACT_ID: string =
  new URLSearchParams(window.location.search).get("contract")?.trim() ||
  import.meta.env.VITE_CONTRACT_ID?.trim() ||
  "subhdotsol.testnet";

/**
 * Public JSON-RPC endpoint used for read-only queries (no wallet needed).
 * A single provider is used on purpose: near-api-js' FailoverRpcProvider retries on *every*
 * error and replaces typed errors like "account does not exist" with a generic one, which
 * would break the deployment check.
 */
export const RPC_URL = "https://test.rpc.fastnear.com";

/** Block explorer used for "view on explorer" links. */
export const EXPLORER_URL = "https://testnet.nearblocks.io";

/**
 * Gas attached to `bid` and `claim` transactions: 30 TGas (1 TGas = 10^12 gas units).
 * Both methods only update state and schedule one token transfer, so this is plenty.
 * Unused gas is refunded to the caller.
 */
export const CALL_GAS = "30000000000000";

/**
 * `code_hash` reported by the RPC for an account that has no contract deployed:
 * 32 zero bytes, which base58-encodes to 32 "1" characters.
 */
export const EMPTY_CODE_HASH = "11111111111111111111111111111111";
