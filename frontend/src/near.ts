/**
 * All communication with the NEAR blockchain lives in this file.
 *
 * There are two ways a web page talks to NEAR:
 *
 *   1. Read-only "view" calls go straight to a public JSON-RPC node via `near-api-js`.
 *      They are free, need no wallet and no signature (e.g. "what is the highest bid?").
 *
 *   2. State-changing "change" calls (`bid`, `claim`) must be signed by the user's account,
 *      cost gas and may carry NEAR tokens. The page never sees private keys: it asks the
 *      user's wallet to sign through `@hot-labs/near-connect`, the wallet connector
 *      recommended by https://docs.near.org/web3-apps/tutorials/wallet-login
 */
import { type FinalExecutionOutcome, JsonRpcProvider } from "near-api-js";
import { AccountDoesNotExistError, ContractMethodNotFoundError } from "near-api-js/rpc-errors";
import { NearConnector, type NearWalletBase } from "@hot-labs/near-connect";

import { CALL_GAS, CONTRACT_ID, EMPTY_CODE_HASH, NETWORK_ID, RPC_URL } from "./config";

/* -------------------------------------------------------------------------- */
/*                               Read-only access                             */
/* -------------------------------------------------------------------------- */

/** RPC client for view calls and account lookups. */
const provider = new JsonRpcProvider({ url: RPC_URL });

/** Mirrors the contract's `Bid` struct as it comes out of JSON (`NearToken` → yoctoNEAR string). */
export interface Bid {
  bidder: string;
  /** Amount in yoctoNEAR (1 NEAR = 10^24 yoctoNEAR), as a decimal string. */
  bid: string;
}

/** Snapshot of everything the contract exposes through its view methods. */
export interface AuctionState {
  highestBid: Bid;
  /** Auction end as a Unix timestamp in **nanoseconds** (NEAR block time unit). */
  endTimeNs: bigint;
  auctioneer: string;
  claimed: boolean;
}

/** Calls a read-only contract method and returns its JSON-decoded result. */
async function view<T extends string | number | boolean | object>(method: string): Promise<T> {
  const result = await provider.callFunction<T>({ contractId: CONTRACT_ID, method, args: {} });
  if (result === undefined) throw new Error(`View method "${method}" returned no value`);
  return result;
}

/** Reads the full auction state with one RPC round-trip per view method, in parallel. */
export async function fetchAuctionState(): Promise<AuctionState> {
  const [highestBid, endTime, auctioneer, claimed] = await Promise.all([
    view<Bid>("get_highest_bid"),
    // `U64` is serialized as a JSON string because JS numbers lose precision above 2^53.
    view<string>("get_auction_end_time"),
    view<string>("get_auctioneer"),
    view<boolean>("is_already_claimed"),
  ]);
  return { highestBid, endTimeNs: BigInt(endTime), auctioneer, claimed };
}

/** Returns an account's total NEAR balance in yoctoNEAR. */
export async function fetchBalance(accountId: string): Promise<bigint> {
  const account = await provider.viewAccount({ accountId });
  return account.amount;
}

/* -------------------------------------------------------------------------- */
/*                         "Is it deployed on testnet?"                       */
/* -------------------------------------------------------------------------- */

/**
 * Outcome of checking `CONTRACT_ID` on testnet. Each status maps to one thing the
 * person running this page has to do next (see the README "Deploy" section).
 */
export type DeploymentStatus =
  /** Account exists, auction code is deployed and `init` has been called. Ready to use. */
  | { kind: "ready"; codeHash: string; state: AuctionState }
  /** No such account on testnet: create it, then deploy. */
  | { kind: "account-missing" }
  /** Account exists but has no contract code: run `cargo near deploy`. */
  | { kind: "no-contract" }
  /** Code is deployed but it does not have the auction's view methods: wrong contract. */
  | { kind: "wrong-contract"; codeHash: string }
  /** Auction code is deployed but `init` was never called (`PanicOnDefault` rejects every call). */
  | { kind: "not-initialized"; codeHash: string }
  /** RPC unreachable or another unexpected failure. */
  | { kind: "error"; message: string };

/**
 * Checks, step by step, whether the auction contract is live on testnet:
 *
 *   1. Does the account exist?                  → `view_account` RPC query
 *   2. Does it hold contract code?              → `code_hash` is not all zeros
 *   3. Is it *this* contract and initialized?   → call the auction's view methods
 */
export async function checkDeployment(): Promise<DeploymentStatus> {
  // Step 1 + 2: account and code.
  let codeHash: string;
  try {
    const account = await provider.viewAccount({ accountId: CONTRACT_ID });
    codeHash = account.code_hash;
  } catch (err) {
    if (err instanceof AccountDoesNotExistError) return { kind: "account-missing" };
    return { kind: "error", message: errorMessage(err) };
  }
  if (codeHash === EMPTY_CODE_HASH) return { kind: "no-contract" };

  // Step 3: probe the view methods. They only exist in this auction contract and they
  // panic with "The contract is not initialized" until `init` has been called.
  try {
    const state = await fetchAuctionState();
    return { kind: "ready", codeHash, state };
  } catch (err) {
    if (err instanceof ContractMethodNotFoundError) return { kind: "wrong-contract", codeHash };
    if (/not initialized/i.test(errorMessage(err))) return { kind: "not-initialized", codeHash };
    return { kind: "error", message: errorMessage(err) };
  }
}

/* -------------------------------------------------------------------------- */
/*                                Wallet access                               */
/* -------------------------------------------------------------------------- */

/**
 * Wallet connector. It shows a modal listing NEAR wallets (MyNearWallet, Meteor, HOT, ...)
 * and loads the chosen wallet's code in a sandboxed iframe. `network: "testnet"` makes
 * every wallet sign for testnet accounts (`*.testnet`) only.
 */
export const connector = new NearConnector({
  network: NETWORK_ID,
  providers: { testnet: [RPC_URL] },
});

/** Wallet the user is currently signed in with, if any. */
let wallet: NearWalletBase | undefined;
/** Account id of the signed-in user, e.g. `alice.testnet`. */
let accountId = "";

export const getSignedInAccount = (): string => accountId;

/**
 * Restores a wallet session saved by a previous visit and subscribes to sign-in /
 * sign-out events (they also fire when the user switches account inside the wallet).
 * `onChange` is called with the new account id ("" when signed out).
 */
export async function initWallet(onChange: (accountId: string) => void): Promise<void> {
  connector.on("wallet:signIn", (payload) => {
    wallet = payload.wallet;
    accountId = payload.accounts[0]?.accountId ?? "";
    onChange(accountId);
  });
  connector.on("wallet:signOut", () => {
    wallet = undefined;
    accountId = "";
    onChange(accountId);
  });

  // Throws when there is no saved session; that simply means "signed out".
  const restored = await connector.getConnectedWallet().catch(() => null);
  if (restored) {
    wallet = restored.wallet;
    accountId = restored.accounts[0]?.accountId ?? "";
  }
  onChange(accountId);
}

/** Opens the wallet picker. Resolves once the user has signed in. */
export async function signIn(): Promise<void> {
  wallet = await connector.connect();
  accountId = (await wallet.getAccounts())[0]?.accountId ?? "";
}

/** Disconnects the current wallet. */
export async function signOut(): Promise<void> {
  if (wallet) await connector.disconnect(wallet);
  wallet = undefined;
  accountId = "";
}

/**
 * Asks the wallet to sign and send one `FunctionCall` to the auction contract.
 * `depositYocto` is the amount of NEAR attached to the call (the bid itself for `bid`).
 * Returns the transaction hash. Throws if the transaction failed on-chain, e.g. when the
 * contract rejects it with "You must place a higher bid".
 */
async function callContract(method: string, depositYocto: bigint): Promise<string> {
  if (!wallet) throw new Error("Connect a wallet first");

  const outcome: FinalExecutionOutcome = await wallet.signAndSendTransaction({
    receiverId: CONTRACT_ID,
    actions: [
      {
        type: "FunctionCall",
        params: { methodName: method, args: {}, gas: CALL_GAS, deposit: depositYocto.toString() },
      },
    ],
  });

  const hash = outcome.transaction_outcome.id;
  // A transaction is included in a block even when the contract panics, so look for
  // a failure in the overall status or in any receipt it produced.
  const failure = [outcome.status, ...outcome.receipts_outcome.map((r) => r.outcome.status)]
    .map((status) => (typeof status === "object" ? status.Failure : undefined))
    .find(Boolean);
  if (failure) throw new TransactionFailedError(hash, describeFailure(failure));
  return hash;
}

/**
 * Places a bid. NEAR has no "approve" step: the bid amount is attached directly to the
 * call. If it beats the current highest bid the contract keeps it and refunds the
 * previous bidder; otherwise the transaction fails and the deposit comes back.
 */
export const placeBid = (amountYocto: bigint): Promise<string> => callContract("bid", amountYocto);

/** Sends the winning bid to the auctioneer. Anyone may call it once the auction has ended. */
export const claim = (): Promise<string> => callContract("claim", 0n);

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/** Raised when a transaction was included on-chain but its execution failed. */
export class TransactionFailedError extends Error {
  constructor(
    readonly txHash: string,
    reason: string,
  ) {
    super(reason);
    this.name = "TransactionFailedError";
  }
}

/**
 * Turns an RPC execution failure into readable text. Contract panics (`require!`) arrive
 * as `{ ActionError: { kind: { FunctionCallError: { ExecutionError: "Smart contract
 * panicked: <message>" } } } }`; for those return just `<message>`.
 */
function describeFailure(failure: unknown): string {
  const text = JSON.stringify(failure);
  const panic = /Smart contract panicked: ([^"\\]+)/.exec(text);
  return panic ? panic[1] : text;
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
