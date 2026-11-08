/// <reference types="vite/client" />

/** Variables read from `frontend/.env` at build time (only `VITE_*` ones reach the browser). */
interface ImportMetaEnv {
  /** Testnet account the auction contract is deployed to, e.g. `my-auction.testnet`. */
  readonly VITE_CONTRACT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
