/**
 * UI controller: wires the HTML in index.html to the blockchain helpers in near.ts.
 *
 * Flow on page load:
 *   1. Check that the contract is deployed + initialized on testnet (deployment card).
 *   2. If it is, show the auction state and keep it fresh (polling + a 1s countdown).
 *   3. Restore any previous wallet session so returning users stay signed in.
 */
import { nearToYocto, yoctoToNear } from "near-api-js";

import "./style.css";
import { CONTRACT_ID, EXPLORER_URL } from "./config";
import {
  type AuctionState,
  type DeploymentStatus,
  checkDeployment,
  claim,
  errorMessage,
  fetchAuctionState,
  fetchBalance,
  getSignedInAccount,
  initWallet,
  placeBid,
  signIn,
  signOut,
  TransactionFailedError,
} from "./near";

/** How often to re-read the auction so bids from other people show up. */
const REFRESH_INTERVAL_MS = 15_000;

/* ------------------------------ DOM lookups ------------------------------ */

/** Typed `getElementById` that fails loudly if index.html and this file drift apart. */
function $<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id} in index.html`);
  return el as T;
}

const ui = {
  contractLink: $<HTMLAnchorElement>("contract-link"),
  deploySteps: $<HTMLOListElement>("deploy-steps"),
  deployMessage: $("deploy-message"),
  recheck: $<HTMLButtonElement>("recheck"),
  auction: $("auction"),
  status: $("status"),
  highestBid: $("highest-bid"),
  highestBidder: $("highest-bidder"),
  auctioneer: $("auctioneer"),
  endTime: $("end-time"),
  countdown: $("countdown"),
  actions: $("actions"),
  account: $("account"),
  walletButton: $<HTMLButtonElement>("wallet-button"),
  bidForm: $<HTMLFormElement>("bid-form"),
  bidAmount: $<HTMLInputElement>("bid-amount"),
  bidButton: $<HTMLButtonElement>("bid-button"),
  bidHint: $("bid-hint"),
  claimButton: $<HTMLButtonElement>("claim-button"),
  log: $<HTMLUListElement>("log"),
};

/* --------------------------------- State --------------------------------- */

/** Latest auction snapshot; `undefined` until the deployment check passes. */
let auction: AuctionState | undefined;
/** True while a wallet popup / transaction is in flight, to block double submits. */
let busy = false;

/* ------------------------------- Formatting ------------------------------ */

/**
 * Formats yoctoNEAR for humans. Amounts too small to show with 5 decimals (like the
 * contract's 1 yoctoNEAR starting bid) are shown in yoctoNEAR instead of "0 NEAR".
 */
function formatNear(yocto: bigint | string): string {
  const value = BigInt(yocto);
  const near = yoctoToNear(value, 5);
  return value > 0n && Number(near) === 0 ? `${value} yoctoNEAR` : `${near} NEAR`;
}

/** NEAR timestamps are nanoseconds; JS `Date` wants milliseconds. */
const nsToMs = (ns: bigint) => Number(ns / 1_000_000n);

/** "1d 2h 3m 4s" style countdown. */
function formatDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const parts = [
    [Math.floor(s / 86_400), "d"],
    [Math.floor((s % 86_400) / 3600), "h"],
    [Math.floor((s % 3600) / 60), "m"],
    [s % 60, "s"],
  ] as const;
  const firstNonZero = parts.findIndex(([n]) => n > 0);
  return firstNonZero === -1
    ? "0s"
    : parts
        .slice(firstNonZero)
        .map(([n, unit]) => `${n}${unit}`)
        .join(" ");
}

/** Creates an `<a>` to the explorer for an account. */
function accountLink(id: string): HTMLAnchorElement {
  const a = document.createElement("a");
  a.href = `${EXPLORER_URL}/address/${id}`;
  a.target = "_blank";
  a.rel = "noreferrer";
  a.textContent = id;
  return a;
}

/* ---------------------------- Activity log ---------------------------- */

/** Prepends a line to the Activity card, optionally linking to a transaction. */
function log(kind: "info" | "success" | "error", message: string, txHash?: string): void {
  const li = document.createElement("li");
  li.className = kind;
  li.append(`${new Date().toLocaleTimeString()} · ${message}`);
  if (txHash) {
    const a = document.createElement("a");
    a.href = `${EXPLORER_URL}/txns/${txHash}`;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.textContent = " view transaction ↗";
    li.append(a);
  }
  ui.log.prepend(li);
}

/* --------------------------- Deployment card --------------------------- */

/**
 * Renders the 3-step checklist (account → code → initialized auction) and a hint on
 * how to fix the first failing step. Mirrors `checkDeployment()` in near.ts.
 */
function renderDeployment(status: DeploymentStatus): void {
  type Step = "ok" | "fail" | "pending";
  const steps: Array<[string, Step]> = [
    ["Account exists on testnet", "pending"],
    ["Contract code is deployed", "pending"],
    ["Auction contract is initialized", "pending"],
  ];
  let message: string;

  switch (status.kind) {
    case "ready":
      steps.forEach((step) => (step[1] = "ok"));
      message = `Live on testnet. Code hash ${status.codeHash}.`;
      break;
    case "account-missing":
      steps[0][1] = "fail";
      message = `${CONTRACT_ID} does not exist on testnet. Create it and deploy the contract (see README).`;
      break;
    case "no-contract":
      steps[0][1] = "ok";
      steps[1][1] = "fail";
      message = `${CONTRACT_ID} exists but has no contract. Run "cargo near deploy" (see README).`;
      break;
    case "wrong-contract":
      steps[0][1] = steps[1][1] = "ok";
      steps[2][1] = "fail";
      message = `${CONTRACT_ID} holds a different contract (code hash ${status.codeHash}); it has no auction methods.`;
      break;
    case "not-initialized":
      steps[0][1] = steps[1][1] = "ok";
      steps[2][1] = "fail";
      message = `The auction code is deployed but "init" was never called. Initialize it (see README).`;
      break;
    case "error":
      message = `Could not reach testnet RPC: ${status.message}`;
      break;
  }

  ui.deploySteps.replaceChildren(
    ...steps.map(([label, state]) => {
      const li = document.createElement("li");
      li.className = state;
      li.textContent = label;
      return li;
    }),
  );
  ui.deployMessage.textContent = message;
}

/* ----------------------------- Auction card ----------------------------- */

/** Fills the auction card and toggles which actions are currently possible. */
function renderAuction(): void {
  if (!auction) return;
  const ended = Date.now() >= nsToMs(auction.endTimeNs);
  // Until someone bids, `init` sets the contract account itself as the highest bidder.
  const hasBids = auction.highestBid.bidder !== CONTRACT_ID;

  ui.status.textContent = auction.claimed
    ? "Ended · funds sent to auctioneer"
    : ended
      ? "Ended · waiting for claim"
      : "Open for bids";
  ui.highestBid.textContent = formatNear(auction.highestBid.bid);
  ui.highestBidder.replaceChildren(
    hasBids ? accountLink(auction.highestBid.bidder) : "No bids yet",
  );
  ui.auctioneer.replaceChildren(accountLink(auction.auctioneer));
  ui.endTime.textContent = new Date(nsToMs(auction.endTimeNs)).toLocaleString();

  renderControls();
}

/** Updates the countdown text; re-renders everything at the moment the auction ends. */
function tick(): void {
  if (!auction) return;
  const left = nsToMs(auction.endTimeNs) - Date.now();
  ui.countdown.textContent = left > 0 ? `(in ${formatDuration(left)})` : "(ended)";
  // Crossing the end time flips bid → claim, so refresh button states once.
  if (left <= 0 && left > -1000) renderAuction();
}

/* ---------------------------- Wallet + actions ---------------------------- */

/**
 * Enables/disables wallet, bid and claim controls based on the current state.
 * The contract enforces the same rules; this just avoids sending doomed transactions.
 */
function renderControls(): void {
  const account = getSignedInAccount();
  const ended = auction ? Date.now() >= nsToMs(auction.endTimeNs) : true;

  ui.walletButton.textContent = account ? "Disconnect" : "Connect wallet";
  ui.walletButton.disabled = busy;

  const canBid = !!auction && !!account && !ended && !busy;
  ui.bidAmount.disabled = ui.bidButton.disabled = !canBid;
  ui.bidHint.textContent = !auction
    ? ""
    : ended
      ? "Bidding is closed."
      : !account
        ? "Connect a testnet wallet to bid."
        : `Your bid must be higher than ${formatNear(auction.highestBid.bid)}. ` +
          "The NEAR you bid is locked in the contract and refunded automatically if someone outbids you.";

  ui.claimButton.disabled = !auction || !account || !ended || auction.claimed || busy;
}

/** Shows the signed-in account and its balance (or "Not connected"). */
async function renderAccount(): Promise<void> {
  const account = getSignedInAccount();
  renderControls();
  if (!account) {
    ui.account.textContent = "Not connected";
    return;
  }
  ui.account.replaceChildren("Signed in as ", accountLink(account));
  try {
    const balance = await fetchBalance(account);
    // The user may have signed out while the balance was loading.
    if (getSignedInAccount() === account) ui.account.append(` · ${formatNear(balance)}`);
  } catch (err) {
    log("error", `Could not load balance: ${errorMessage(err)}`);
  }
}

/** Re-reads the auction from the chain. Errors are logged, not thrown, for polling. */
async function refreshAuction(): Promise<void> {
  try {
    auction = await fetchAuctionState();
    renderAuction();
  } catch (err) {
    log("error", `Could not refresh auction: ${errorMessage(err)}`);
  }
}

/**
 * Wraps a wallet action: blocks the UI while it runs, logs the result (with an
 * explorer link) and refreshes auction + balance afterwards.
 */
async function runTransaction(label: string, send: () => Promise<string>): Promise<void> {
  busy = true;
  renderControls();
  log("info", `${label}: confirm in your wallet…`);
  try {
    const hash = await send();
    log("success", `${label} succeeded.`, hash);
  } catch (err) {
    const hash = err instanceof TransactionFailedError ? err.txHash : undefined;
    log("error", `${label} failed: ${errorMessage(err)}`, hash);
  } finally {
    busy = false;
    await Promise.all([refreshAuction(), renderAccount()]);
  }
}

/* ------------------------------ Event wiring ------------------------------ */

ui.walletButton.addEventListener("click", async () => {
  try {
    if (getSignedInAccount()) await signOut();
    else await signIn();
  } catch (err) {
    // Closing the wallet picker rejects too; that is not worth an error line.
    const message = errorMessage(err);
    if (!/reject|cancel|closed/i.test(message)) log("error", `Wallet: ${message}`);
  }
  await renderAccount();
});

ui.bidForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!auction) return;

  // Accept plain decimals only, max 24 fractional digits (1 yoctoNEAR = 10^-24 NEAR).
  const input = ui.bidAmount.value.trim();
  if (!/^\d+(\.\d{1,24})?$/.test(input)) {
    log("error", `"${input}" is not a valid NEAR amount (use e.g. 0.5).`);
    return;
  }
  const amount = nearToYocto(input as `${number}`);
  if (amount <= BigInt(auction.highestBid.bid)) {
    log("error", `Bid must be higher than ${formatNear(auction.highestBid.bid)}.`);
    return;
  }

  await runTransaction(`Bid of ${formatNear(amount)}`, () => placeBid(amount));
  ui.bidAmount.value = "";
});

ui.claimButton.addEventListener("click", () => runTransaction("Claim", claim));

ui.recheck.addEventListener("click", () => void start());

/* --------------------------------- Startup -------------------------------- */

/** Runs the deployment check and, when it passes, shows the auction UI. */
async function start(): Promise<void> {
  ui.recheck.disabled = true;
  ui.deployMessage.textContent = `Checking ${CONTRACT_ID} on testnet…`;
  const status = await checkDeployment();
  renderDeployment(status);
  ui.recheck.disabled = false;

  const ready = status.kind === "ready";
  ui.auction.hidden = ui.actions.hidden = !ready;
  auction = ready ? status.state : undefined;
  renderAuction();
  tick();
}

ui.contractLink.replaceWith(accountLink(CONTRACT_ID));

await start();
setInterval(tick, 1000);
setInterval(() => auction && !busy && void refreshAuction(), REFRESH_INTERVAL_MS);

await initWallet(() => void renderAccount()).catch((err) =>
  log("error", `Wallet setup failed: ${errorMessage(err)}`),
);
