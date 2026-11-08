# NEAR Protocol — Complete Notes for a Solana Developer

> Goal: you don't need to be a NEAR expert to take part in the hackathon. You need to understand how NEAR works, know which parts differ from Solana, and learn the tools needed to ship a working project.
>
> These notes go from NEAR's origins → execution model → account model → storage → consensus → sharding → smart contracts → cross-chain infrastructure → the hackathon.

---

## Table of Contents

1. [The NEAR Hackathon](#1-the-near-hackathon)
2. [What is NEAR Protocol?](#2-what-is-near-protocol)
3. [Why NEAR was created — history](#3-why-near-was-created--history)
4. [Architecture: the six layers](#4-architecture-the-six-layers)
5. [Account model (biggest difference from Solana)](#5-account-model-biggest-difference-from-solana)
6. [Smart contracts on NEAR](#6-smart-contracts-on-near)
7. [Transactions, Actions and Receipts](#7-transactions-actions-and-receipts)
8. [Nightshade: how NEAR scales](#8-nightshade-how-near-scales)
9. [Consensus and validators](#9-consensus-and-validators)
10. [Gas, storage and $NEAR](#10-gas-storage-and-near)
11. [How tokens work on NEAR](#11-how-tokens-work-on-near)
12. [Cross-chain architecture (Chain Abstraction)](#12-cross-chain-architecture-chain-abstraction)
13. [Privacy and AI infrastructure](#13-privacy-and-ai-infrastructure)
14. [Security differences: NEAR vs Solana](#14-security-differences-near-vs-solana)
15. [Full Solana vs NEAR comparison](#15-full-solana-vs-near-comparison)
16. [The hackathon in detail](#16-the-hackathon-in-detail)
17. [Which track to choose + recommended project](#17-which-track-to-choose--recommended-project)
18. [Developer toolkit](#18-developer-toolkit)
19. [Learning roadmap](#19-learning-roadmap)
20. [Docs to read, in order](#20-docs-to-read-in-order)
21. [Final takeaways](#21-final-takeaways)
22. [Sources referenced](#22-sources-referenced)

---

## 1. The NEAR Hackathon

**NEAR Hackathon 2026**: running now, online, two weeks, **November 1–14, 2026**.

| Item | Value |
| --- | --- |
| Total prize pool | **$250,000** |
| Grand prize | **$55,000** |
| Competition tracks | **13** |
| Per-track prizes | 1st **$10,000** · 2nd **$3,000** · 3rd **$2,000** |
| Prize currency | Paid in **NEAR** |
| Final submission deadline | **Nov 14, 2026, 23:59 UTC** = **Nov 15, 05:29 IST** |
| Results expected | **Nov 18, 2026, 23:59 UTC** = **Nov 19, 05:29 IST** |
| Registration before building | **Not required** |

**Official links**
- Hackathon website (tracks, rules, submission): https://nearhackathon.com/
- NEAR Developer Hub: https://www.near.org/developer-hub
- NEAR developer documentation: https://docs.near.org/

**Key rule:** you need
1. A **public GitHub repository**.
2. A **public X (Twitter) demo post** that:
   - says you built it at **NEAR HACKATHON**,
   - tags **`@NEARProtocol`**,
   - includes **`#NEARHackathon`**,
   - contains a **demo video or screenshots**.
3. Both links submitted **before the deadline**.

**Screening:** Claude Code and Codex screen projects before the human jury evaluates them.

### The 13 tracks

| Track | Focus |
| --- | --- |
| Unstoppable DeFi | Cross-chain trading, lending, vaults and agents |
| Investment Thesis | Analytics and data-backed NEAR investment research |
| Privacy & Private AI | Confidential applications and AI |
| Autonomous Business | AI-operated businesses and treasuries |
| AI Swarms | Coordinating, transacting AI agents |
| AI Security & Defense | Wallet safeguards, spending limits and scam detection |
| Agent Economy | Agents earning, spending and paying one another |
| Real-World Money | Payroll, invoices, remittances and stablecoins |
| Games With Real Economies | Games with real financial activity |
| NFTs That Do Something | NFTs with funds, royalties and utility |
| Memecoins With Mechanics | Programmable token and community mechanics |
| Social Money | Shared budgets and community ownership |
| Open Innovation | New ideas that fit the NEAR ecosystem |

**Observation:** the hackathon leans heavily toward **AI agents, autonomous payments, programmable money and cross-chain applications**. It is not just a contest to build another smart contract.

---

## 2. What is NEAR Protocol?

NEAR Protocol is a **Layer-1 blockchain**, like Solana, Ethereum, Sui and Aptos.

A blockchain is basically a global computer that:
- is run by independent participants around the world;
- keeps a shared state that anyone can verify;
- lets developers deploy programs that anyone can call;
- processes transactions without relying on one central company;
- has its own consensus mechanism and economic incentives;
- uses a native token to pay for execution and network resources.

NEAR does all of this, but its **architecture is very different from Solana's**.

### Core concepts

| Component | Meaning |
| --- | --- |
| NEAR Protocol | The underlying Layer-1 blockchain |
| $NEAR | Native token |
| Validators | Nodes that secure the network and process blocks/chunks |
| Nightshade | NEAR's sharding architecture |
| Smart contracts | Programs deployed to NEAR accounts |
| WASM | Execution format for smart contracts |
| NEAR accounts | Identities that hold balances, keys and, optionally, contracts |
| Access Keys | Keys with permissions to operate an account |
| Receipts | Internal messages that represent work to be executed |
| NEAR Intents | Outcome-oriented, multi-chain execution protocol |
| Chain Signatures | MPC-based signing infrastructure for other chains |

> ⚠️ **NEAR Protocol ≠ the NEAR ecosystem.** NEAR AI, NEAR Intents, Aurora and other ecosystem products build on or integrate with NEAR infrastructure. They are **not** all part of the base Layer-1.

---

## 3. Why NEAR was created — history

NEAR did **not** start as a typical blockchain startup.

### Founders

| Founder | Background |
| --- | --- |
| **Illia Polosukhin** | Machine-learning researcher at Google; co-author of *"Attention Is All You Need"* (the Transformer paper) |
| **Alexander Skidanov** | Distributed-systems engineer; worked at MemSQL (now SingleStore) |

### Origin story
- In **2017**, Illia and Alex were working on an AI idea: systems that help people **write software using natural language**.
- Illia brought machine learning; Alex brought production-grade distributed databases.
- They needed infrastructure to **train models** and **coordinate contributors worldwide**.
- They hit two problems:
  1. AI training needed **more compute** than they could easily get.
  2. **Paying contributors internationally was hard**: many had no bank account, and crypto payments were expensive at the time.
- They looked at blockchains and found that existing ones lacked the **scalability and developer experience** they needed.
- So they decided to **build their own**. NEAR was founded in **2018**.

### Timeline

| # | When | Event |
| --- | --- | --- |
| 1 | **2017** | Original AI research: natural-language programming and distributed infrastructure. Illia co-authors *Attention Is All You Need*. |
| 2 | **2018** | NEAR founded; work starts on a blockchain with better scalability and usability. |
| 3 | **2019** | NEAR Whitepaper and **Nightshade** design published, including the sharded architecture: scale computation **horizontally** instead of making every validator do every operation. |
| 4 | **2020** | Mainnet launches in **April**; **token transfers** are enabled in **October**. |
| 5 | **2021** | **Simple Nightshade**, the first step toward sharding, goes live. State starts being distributed across shards. |
| 6 | **2022** | More sharding work: transaction processing is distributed among shard-specific producers. |
| 7 | **2024** | **Nightshade 2.0**: **stateless validation** goes live on mainnet, improving scalability and how validators check shard state transitions. |
| 8 | **2024** | **Chain Signatures** reach mainnet; **NEAR Intents** emerge, executing transactions across networks through competing solvers. |
| 9 | **2025** | **Sharded smart-contract** capabilities; a reported **1M TPS** scalability benchmark in an **experimental environment**. |
| 10 | **July 2026** | Network upgrade **2.13**: **dynamic resharding** (automatic shard resizing) and a **NIST-standardised post-quantum signature scheme** on mainnet. |
| 11 | **2026** | Ecosystem focus moves to **AI agents, cross-chain finance, confidential execution and programmable payments**. **Confidential Intents** becomes generally available to developers. |

**Insight:** NEAR's original ambition was infrastructure for **huge numbers of users**. The current focus on AI agents and autonomous commerce **continues that ambition**; it is not an unrelated pivot.

Official history: https://www.near.org/roadmap-history

---

## 4. Architecture: the six layers

Think of NEAR as six connected layers:

```
┌──────────────────────────────────────────────────────────┐
│ APPLICATION LAYER                                         │
│ Frontend · Wallets · dApps · AI agents                    │
├──────────────────────────────────────────────────────────┤
│ ACCOUNT & AUTHORIZATION LAYER                             │
│ Accounts · Access Keys · Permissions                      │
├──────────────────────────────────────────────────────────┤
│ EXECUTION LAYER                                           │
│ WASM · Smart contracts · Runtime · Gas                    │
├──────────────────────────────────────────────────────────┤
│ COMMUNICATION LAYER                                       │
│ Transactions · Actions · Receipts · Promises              │
├──────────────────────────────────────────────────────────┤
│ CONSENSUS & SCALING                                       │
│ Proof of Stake · Doomslug · Nightshade · Shards           │
├──────────────────────────────────────────────────────────┤
│ ECONOMIC LAYER                                            │
│ $NEAR · Gas · Storage staking · Validator staking         │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Account model (biggest difference from Solana)

> 🔴 **Pay close attention here.** How you understand the account model affects almost everything you build.

In Solana you usually deal with:
- wallet accounts
- program accounts
- Program-Derived Addresses (PDAs)
- token accounts
- program-owned data accounts
- signers and account authorities

**NEAR works differently.** An account is **not just a wallet address**. It is an **on-chain identity** that can hold:
- assets,
- access keys,
- executable code,
- persistent storage.

**A contract is deployed directly to an account.**

### 5.1 What a NEAR account looks like

Named accounts:

```
alice.near
bob.near
cypher.near
trading.near
```

This is a major UX decision. Instead of remembering `7xKXtg2CW87d...`, people use `alice.near`.

**Hierarchical accounts (subaccounts):**

```
alice.near
    |
    ├── wallet.alice.near
    ├── trading.alice.near
    └── agent.alice.near
```

- The **parent account controls creation of its direct subaccounts**.
- Useful for apps that need separate accounts for users, agents or app components.

### 5.2 Account ID types

| Type | Example | Description |
| --- | --- | --- |
| Named | `alice.near` | Human-readable account |
| Implicit | 64-character hex | Derived from an **Ed25519 public key** |
| Ethereum-like | `0x...` | Controlled through Ethereum-compatible keys |
| Deterministic | `0s...` | Derived from **initial code and storage** |
| Universal | `0u...` | Derived from **initial code, storage and keys** |

👉 Start by learning **named** and **implicit** accounts; those two matter most.

### 5.3 What an account contains

Example: `trading.near`

```
trading.near
│
├── Account ID
│
├── NEAR balance
│
├── Locked balance
│
├── Access Keys
│   ├── Full Access Key
│   ├── Function Call Key
│   └── Other authorized keys
│
├── Smart Contract Code
│   └── trading.wasm
│
└── Persistent Storage
    ├── users
    ├── orders
    ├── positions
    └── configuration
```

- Account state = **balance + keys + code + storage data**.
- The **contract is optional**. A normal user account has no code.
- **Code and storage are separate.** Replacing the deployed WASM **does not erase** stored data.

### 5.4 Access Keys

One of NEAR's most interesting features, especially relevant to **session-wallet UX**.

A NEAR account can have **multiple keys**, each with its own permissions. There are two basic permission types.

#### A. Full Access Key
Unrestricted control over the account. It can:
- transfer NEAR
- add or remove keys
- deploy contracts
- call contracts
- create subaccounts
- delete the account

→ Think of it as the **primary admin key**.

#### B. Function Call Key
A **restricted** key that can only interact with an **authorised contract**.

| Property | Purpose |
| --- | --- |
| `receiver_id` | Which contract the key can call |
| `method_names` | Which methods it can call |
| `allowance` | How much NEAR it can spend **on gas** |

- It **cannot attach NEAR deposits** to a call.

Example:

```
User account: alice.near

Function Call Key:
    receiver_id: trading.near
    method_names:
        - place_order
        - cancel_order
    allowance: 1 NEAR
```

The app can use this key to call the allowed methods **without asking the user to sign every transaction** with their full-access key.

> ⚠️ **Security boundary:** a Function Call Key does **not** enforce app-level limits such as trade size, token amounts or slippage. **The contract itself must enforce those.**

#### C. Gas Keys
- Use **prepaid gas balances** and **independent nonce lanes**.
- Useful when an app needs **many concurrent transactions** without all of them sharing one ordinary nonce sequence.

#### Why this matters for AI agents
- You own an account.
- You give an agent a **restricted key**.
- That key can only call **your app's approved contract methods**.
- **Your contract** enforces spending and trading policies.
- The agent **can't use that key to transfer all your NEAR**.

→ This is a very different way to authorize an app than giving an autonomous service full access to a wallet.

### 5.5 NEAR accounts vs Solana accounts

| Solana | NEAR equivalent / difference |
| --- | --- |
| Wallet public key | NEAR Account ID |
| Keypair | Access Key |
| Program ID | Contract deployed to an account |
| Program-owned state accounts | Contract account's persistent storage |
| PDA | **No exact equivalent**; deterministic accounts and account-based authorization serve different purposes |
| Signer | Transaction signer / Access Key |
| SPL token account | FT balance tracked **inside the token contract** |
| ATA | **No universal ATA equivalent** |
| Program authority | Account's access-key permissions |
| Session signing | Function Call Keys / Gas Keys + app-level authorization |

**Key point:** Solana separates **program code** and **app state** much more explicitly. NEAR puts **contract code and its persistent state under one contract account**.

**Solana:**

```
Wallet
  |
  └── Transaction
        |
        ├── Program A
        ├── PDA 1
        ├── PDA 2
        └── Token Account
```

**NEAR:**

```
alice.near
  |
  ├── Access Keys
  |
  └── Calls
        |
        ▼
    trading.near
        |
        ├── Contract Code
        └── Persistent State
              ├── Positions
              ├── Orders
              └── Balances
```

→ You **don't create a PDA for each piece of contract state** the way you would on Solana.

Further reading: https://docs.near.org/protocol/accounts-contracts/account-model

---

## 6. Smart contracts on NEAR

- Contracts are written in **Rust** and compiled to **WebAssembly (WASM)**.
- There is also **JavaScript/TypeScript** contract tooling.
- **Recommended for you: Rust + `near-sdk`** (you already know Rust).

### 6.1 What is WASM?
- **WebAssembly** is a portable binary instruction format for running code in different environments.
- Normally, Rust on an M2 Mac compiles to **ARM64** machine code. For NEAR you compile to **WebAssembly** instead.

```
Rust source code
       |
       ▼
Rust compiler
       |
       ▼
WebAssembly target
       |
       ▼
    .wasm
       |
       ▼
Deploy to NEAR account
       |
       ▼
NEAR Runtime executes it
```

- The contract **doesn't run as a normal Linux/macOS binary**. The NEAR runtime executes it in its **deterministic** smart-contract environment.

### 6.2 Your first NEAR contract (official workflow)

```bash
cargo near new hello-world
cd hello-world
cargo near build
cargo test
cargo near deploy
```

These commands create a Rust contract project, build it, run tests and deploy it.

Docs: https://docs.near.org/smart-contracts/quickstart

### 6.3 What a contract looks like

```rust
use near_sdk::near;

#[near(contract_state)]
#[derive(Default)]
pub struct Counter {
    count: u64,
}

#[near]
impl Counter {
    pub fn increment(&mut self) {
        self.count += 1;
    }

    pub fn get_count(&self) -> u64 {
        self.count
    }
}
```

- `pub fn increment(&mut self)` **changes** persistent state → needs a **transaction** (paid).
- `pub fn get_count(&self) -> u64` **reads** state → a **view method** you can query **without** a paid transaction.

### 6.4 How state is stored
- **Solana:** you work with explicit accounts and deserialize the account data passed into an instruction.
- **NEAR:** the **contract manages its own persistent storage**.

```rust
#[near(contract_state)]
pub struct TradingContract {
    admin: AccountId,
    total_orders: u64,
    total_volume: u128,
}
```

- The Rust SDK serializes contract state. **Borsh** is used for persisted state.
- For larger data, NEAR provides **collections and storage abstractions**.
- ⚠️ Ordinary Rust variables **don't persist** between calls. Anything that must survive has to go through NEAR's persistent storage.

### 6.5 Contract annotations and environment functions

| Feature | Purpose |
| --- | --- |
| `#[near]` | Defines the contract interface |
| `#[init]` | Initialization method |
| `#[payable]` | Allows attached deposits |
| `#[private]` | Restricts a method so only the contract itself can call it |
| `env::predecessor_account_id()` | **Immediate** caller |
| `env::signer_account_id()` | **Original** transaction signer |
| `env::attached_deposit()` | Deposit attached to the call |
| `env::current_account_id()` | Current contract account |

> 🔴 **`predecessor_account_id()` ≠ `signer_account_id()`**

```
Alice
  |
  ▼
Contract A
  |
  ▼
Contract B
```

When Contract A calls Contract B:
- B's **predecessor** is **Contract A**.
- The original **signer** may still be **Alice**.

→ For access control, know **which identity your check actually uses**. Pay special attention to this when auditing NEAR contracts.

---

## 7. Transactions, Actions and Receipts

> 🔴 **The biggest thing to unlearn from Solana.**

Solana relies on **atomic transactions** with multiple instructions and possibly multiple **CPIs**. NEAR uses:

```
Transactions → Actions → Receipts → Execution → Additional Receipts
```

### 7.1 What is a transaction?
A **signed request** asking the network to perform certain actions.

```
Transaction
│
├── Signer
├── Receiver
├── Actions
├── Public Key
├── Nonce
└── Recent Block Hash
```

| Field | Meaning |
| --- | --- |
| Signer | Account authorizing the transaction |
| Receiver | Account the actions are performed on |
| Actions | Operations being requested |
| Public Key | Key used to verify the signature |
| Nonce | Ordering and replay protection **for that access key** |
| Block Hash | Limits how long the transaction stays valid |

### 7.2 What are Actions?

| Action | What it does |
| --- | --- |
| `CreateAccount` | Creates a new account |
| `DeployContract` | Deploys WASM code |
| `FunctionCall` | Executes a contract method |
| `Transfer` | Transfers native NEAR |
| `Stake` | Stakes NEAR |
| `AddKey` | Adds an access key |
| `DeleteKey` | Removes an access key |
| `DeleteAccount` | Deletes an account |

Example:

```
Transaction
    |
    ├── Signer: alice.near
    |
    ├── Receiver: trading.near
    |
    └── Actions
          |
          └── FunctionCall
                |
                ├── Method: place_order
                ├── Arguments: {...}
                ├── Gas: ...
                └── Deposit: ...
```

### 7.3 What are Receipts?
- A **receipt** is an **internal message** representing work the network must execute.
- When your transaction enters the network, it is **converted into a receipt**.
- The receipt is processed by the **appropriate shard** and can **create more receipts**.

```
Alice
  |
  | Signs transaction
  |
  ▼
NEAR Network
  |
  ▼
Trading Contract
  |
  | Executes place_order()
  |
  ├── Updates local state
  |
  └── Creates receipt for another contract
                |
                ▼
           Token Contract
                |
                ▼
           Executes transfer
                |
                ▼
            Callback
                |
                ▼
          Trading Contract
```

**Why receipts exist:** NEAR is **sharded**. Accounts can live on **different shards**, so they communicate through **messages that are routed between shards**. Receipts are that mechanism.

### 7.4 Cross-contract calls: NEAR's alternative to CPI

**Solana (synchronous CPI inside the transaction):**

```rust
invoke(
    &instruction,
    account_infos
)?;
```

**NEAR: cross-contract calls are asynchronous** and use the **Promise** system.

```
Trading Contract
     |
     | Calls Token Contract
     |
     ▼
Token Contract
     |
     | Performs its operation
     |
     ▼
Promise Result
     |
     ▼
Trading Contract Callback
```

- The caller **doesn't pause and wait** like a synchronous function call.
- Usually the caller **schedules an external call and a callback**, and they **run in separate blocks**.
- **The contract can receive other calls in the meantime.**

### 7.5 How this changes secure contract design

Scenario: Alice has **100 tokens** recorded in your contract and asks to withdraw **50**.

❌ **Dangerous design:**

```
1. Send 50 tokens to Alice.
2. Wait for token contract.
3. Callback executes.
4. Reduce Alice's recorded balance.
```

→ If Alice withdraws again **before the callback runs**, she can withdraw the **same funds twice**.

✅ **Correct design:**

```
1. Verify Alice's balance.
2. Deduct 50 from her available balance.
3. Mark the withdrawal as pending.
4. Schedule the external transfer.
5. Execute callback.
6. Finalize the withdrawal.
7. Refund or restore state if appropriate.
```

→ A second withdrawal can't spend the same balance. The NEAR docs warn about this explicitly.

> 🔐 **Security rule:** never assume a cross-contract call and its callback are **one atomic operation**. You must also handle **failed receipts, callbacks and refunds**. This is an important new area to study as a contract auditor.

---

## 8. Nightshade: how NEAR scales

NEAR was designed to **scale horizontally**. Its sharding architecture is called **Nightshade**.

### 8.1 What is sharding?
- If every validator processes every transaction, each node does more work as usage grows, which creates a **bottleneck**.
- **Sharding** splits the blockchain into multiple pieces.
- Database analogy: instead of one huge server handling every request, data and processing are spread across several machines, each handling part of the work.

```
                  NEAR NETWORK
                       |
          ┌────────────┼────────────┐
          |            |            |
          ▼            ▼            ▼
       SHARD 0      SHARD 1      SHARD 2
          |            |            |
          ▼            ▼            ▼
      Accounts      Accounts      Accounts
      Contracts     Contracts     Contracts
      Execution     Execution     Execution
          |            |            |
          └────────────┼────────────┘
                       |
                 Shared network
                  consensus
```

- Shards are **not independent blockchains** that users bridge between manually.
- They are parts of **one NEAR network**.
- **Accounts are distributed across shards**, and transactions are routed to the right execution environment.

### 8.2 How Nightshade works (simplified)
1. A user submits a transaction.
2. The network identifies the relevant **receiver and shard**.
3. That shard processes its transactions.
4. Validators **produce and validate shard chunks**.
5. If another shard needs to do work, **receipts are routed there**.
6. The network maintains a **globally consistent chain**.

- **Block producers** and shard-specific **chunk producers** have different responsibilities.
- Work is processed **across multiple shards** instead of through one execution bottleneck.

### 8.3 Stateless validation
- Arrived with **Nightshade 2.0** on mainnet in **August 2024**.
- Previously, validating a shard's state transition could require validators to hold that shard's **entire state** locally.
- Now a validator checks a shard's state transition using the **state witness** provided for that transition.
- This **lowers infrastructure requirements** and helps NEAR **scale to more shards**.
- **Key idea:** producing and validating state **doesn't require every validator to hold the whole shard state**.

### 8.4 Dynamic resharding
- Major **2026** upgrade.
- Before: adding shards required **coordinated protocol upgrades**.
- Now: the protocol **splits shards automatically** as their state grows, like a database partition that gets too big and splits.
- **Network upgrade 2.13** launched on mainnet on **July 20, 2026**, with:
  - **dynamic resharding**,
  - **post-quantum ML-DSA** signing support.

### 8.5 The "1 million TPS" claim
- It refers to a **scalability benchmark in an experimental environment**, plus the architectural work behind large horizontal scaling.
- ⚠️ It is **not** the sustained transaction rate of public mainnet. Keep this distinction in mind when evaluating performance claims.

### 8.6 Nightshade 3.0 and SPICE
- **SPICE = Separation of Consensus and Execution.**
- Goal: **decouple transaction ordering from execution**, so consensus doesn't wait on every execution step and the network can handle more complex work.
- The newer architecture also adds:
  - **multi-contract atomic interactions**,
  - a **private execution shard**.
- NEAR's product site describes **Nightshade 3.0** and its private shard. The **September 2026 SPICE technical series** (Near One Blog) goes into more detail.
- ✅ You **don't need** any of these protocol-level changes to build a normal contract for the hackathon.

---

## 9. Consensus and validators

NEAR uses **Proof of Stake (PoS)**: validators **stake NEAR** to help secure the network.

**Validator responsibilities:**
- producing blocks
- producing shard chunks
- validating state transitions
- participating in consensus
- keeping the network available

Token holders can **delegate** NEAR to validators and take part economically in network security.

### Doomslug
- NEAR's original consensus mechanism.
- Lets the network produce blocks quickly and reach **deterministic finality** in relatively few block-production rounds.

| Term | Meaning |
| --- | --- |
| Block time | How often new blocks are produced |
| Finality | When a block is guaranteed not to be reverted in the canonical finalized chain |

- NEAR currently advertises **~600 ms block times** and **~1.2 s finality**.
- **Consensus** decides the **order and finality** of the chain. The **runtime** executes actions and applies state changes.

### Epoch
- A period during which the **validator configuration stays the same**.
- Used for **validator selection** and other network operations.
- App developers usually **don't touch epochs directly**. They matter for staking, validator economics and consensus internals.

---

## 10. Gas, storage and $NEAR

The native token **NEAR** is used for three main things.

### 10.1 Transaction fees (gas)
Every state-changing transaction pays **gas**, which covers the compute and network resources it uses.

```
Transaction
     |
     ▼
Calculate Gas Consumption
     |
     ▼
Apply Gas Price
     |
     ▼
Charge NEAR
```

- **Deterministic gas units** × a **network-dependent gas price**.
- ⚠️ **Attaching more gas does NOT make a transaction run faster.** Gas is an **execution budget**, not a priority fee as on Solana.

### 10.2 Storage staking
> 🔴 Understand this well.

- When a contract stores data, an amount of NEAR **proportional to the storage used is locked**.

```
Alice deposits funds
       |
       ▼
Contract stores Alice's data
       |
       ▼
Storage usage increases
       |
       ▼
Required NEAR storage stake increases
       |
       ▼
NEAR becomes locked
```

- When the data is **removed**, the stake can be **released**.
- This is different from paying recurring rent or burning SOL.
- Think about a trading app with **a million users**: the contract has to account for the storage cost of all their records.
- ✅ **Design so users fund their own storage.** Don't let malicious users force the contract owner to pay for unlimited state growth.

### 10.3 Validator staking
- Validators stake NEAR and earn **rewards** for doing their network duties.
- Others can **delegate** tokens to validators.
- This is **separate from storage staking**.

### 10.4 yoctoNEAR
yoctoNEAR is NEAR's equivalent of Solana's lamports:

```
1 NEAR = 10^24 yoctoNEAR
```

- Handle all contract-level amounts with **exact integer arithmetic**, never floating point.
- That's why you'll see **`u128`** and **`NearToken`** in Rust contracts.

---

## 11. How tokens work on NEAR

Besides the native token, most **fungible tokens are smart contracts**.

| Standard | Purpose | Solana comparison |
| --- | --- | --- |
| **NEP-141** | Fungible tokens | SPL Token (conceptually) |
| **NEP-145** | Token storage management | No exact equivalent |
| **NEP-148** | Fungible-token metadata | Token metadata |
| **NEP-171** | NFTs | Token Metadata NFT standard (conceptually) |
| **NEP-177** | NFT metadata | NFT metadata |
| **NEP-245** | MultiTokens | Multi-token standard |

### 11.1 How a fungible token works
Someone launches a USDC-like token by deploying an FT contract, e.g. `usdc.token.near`. **The contract tracks balances internally:**

```
usdc.token.near
       |
       ├── Alice: 100 USDC
       ├── Bob:    50 USDC
       └── Carol:  75 USDC
```

- **Solana:** users usually have a **separate token account per mint**.
- **NEAR:** the FT contract keeps a **mapping from account ID to balance**.
- Token balances are **not** stored as native balances in the user's NEAR account.

### 11.2 Storage registration
Before an account can receive a token, it may need to **register with the FT contract** by paying the storage deposit.

```
User
  |
  ▼
storage_deposit()
  |
  ▼
Token contract registers account
  |
  ▼
ft_transfer()
  |
  ▼
Balance updated
```

**`ft_transfer_call`**: transfers tokens to a **receiver contract** and calls its receiving method, followed by a **resolver** step that can **refund unused tokens**. Study this carefully if you build DeFi.

Docs:
- NEP-141 standard: https://docs.near.org/primitives/ft/standard
- Using fungible tokens: https://docs.near.org/primitives/ft/ft

---

## 12. Cross-chain architecture (Chain Abstraction)

NEAR wants apps to work with **multiple blockchains** without users having to understand each chain's infrastructure. It calls this **Chain Abstraction**.

Two things to understand. **They solve different problems:**
1. **Chain Signatures**
2. **NEAR Intents**

### 12.1 Chain Signatures
> Highly relevant to your Solana experience.

Chain Signatures use **Multi-Party Computation (MPC)** so that **NEAR accounts and smart contracts can request signatures for transactions on other chains**.

**Supported networks include:** Solana, Bitcoin, Ethereum, Cosmos, Sui, Aptos and other EVM networks.

Normal flow:

```
Solana Keypair
     |
     ▼
Solana Address
```

With Chain Signatures (`alice.near` controls a Solana account):

```
NEAR Account
     |
     ▼
NEAR Smart Contract
     |
     ▼
MPC Signer Infrastructure
     |
     ▼
Threshold Signature
     |
     ▼
Solana Transaction
     |
     ▼
Solana Network
```

- MPC participants **jointly produce a signature** without giving your app the full private key.
- **Your app** builds the chain-specific transaction → **requests a signature** → **broadcasts** the signed transaction to the target chain.

> ⚠️ Chain Signatures provide **signing only**. They do **not** automatically execute arbitrary Solana programs, bridge tokens, or give NEAR contracts arbitrary Solana account data. You still need **transaction construction, broadcasting and cross-chain state verification**.

**Why it's interesting (example):**
- A user creates a NEAR account.
- Your app **derives an MPC-controlled Solana address** tied to the user's identity.
- An agent requests an **authorised transaction signature** through NEAR.
- → **NEAR authorization logic connected to Solana execution.**

Docs: https://docs.near.org/chain-abstraction/chain-signatures

### 12.2 NEAR Intents
An **intent** is fundamentally different from a transaction.

Traditional transaction: you describe the **operations**:

```
Swap 1 SOL for USDC
using this particular route
with these transaction instructions.
```

Intent: you describe the **desired outcome**:

```
I want to exchange 1 SOL
for the best available amount of USDC.
```

You don't have to choose the route. **Solvers** do that.

#### How NEAR Intents work

```
01  User creates an intent
    e.g. "Swap SOL for USDC at the best available price."
        │
        ▼
02  Solver network
    Off-chain market makers compete to fulfil the requested outcome.
        │
        ▼
03  Best quote is presented
    The user or agent can approve the proposed solution.
        │
        ▼
04  Intent execution
    The accepted solution is settled through the NEAR verifier
    contract and relevant execution infrastructure.
        │
        ▼
05  Outcome fulfilled
    The user receives the requested outcome if execution succeeds.
```

#### Who are solvers?
Market participants competing to fulfil intents:

```
User wants 1 SOL -> USDC

Solver A:
  Returns 180 USDC

Solver B:
  Returns 182 USDC

Solver C:
  Returns 183 USDC
```

- The best quote is chosen based on the intent's **actual conditions**, not just the headline output amount.
- Solvers may use **different liquidity sources and routes**.
- → Execution becomes a **competitive marketplace**.

### 12.3 Chain Signatures vs Intents

| Chain Signatures | NEAR Intents |
| --- | --- |
| Provides **signing** capability | Provides an **outcome-oriented execution marketplace** |
| Uses **MPC** infrastructure | Uses **competing solvers** |
| Can sign foreign-chain transactions | Fulfils user requests across chains and services |
| Helps control external addresses | Helps fulfil cross-chain outcomes |
| A **cryptographic signing primitive** | A **transaction coordination and settlement protocol** |

They can be **used together**, but neither is another name for the other.

Docs:
- NEAR Intents overview: https://docs.near.org/chain-abstraction/intents/overview
- Chain Abstraction: https://docs.near.org/chain-abstraction/what-is
- NEAR Intents product: https://intents.near.org/

---

## 13. Privacy and AI infrastructure

The NEAR ecosystem now goes well beyond ordinary smart contracts.

### 13.1 Confidential Intents and the Private Shard
**Private Shard**: a private execution environment that runs transactions **without exposing the same information** as normal public execution.

Built from:
- a **dedicated private shard**,
- a **restricted validator set**,
- a **TEE-based bridge** connecting the private environment to public NEAR infrastructure.

It is the **foundation of Confidential Intents**.

**Why it matters:** suppose someone trades $10M of assets. On a public chain, observers can see:
- transaction amounts
- token pairs
- wallet activity
- trading positions
- transaction timing

→ This creates **MEV, front-running and strategy-copying** risks, which Confidential Intents is designed to address.

> ⚠️ A normal public NEAR contract is **NOT private by default**. Its state is publicly visible. Don't confuse NEAR's private execution infrastructure with deploying an ordinary Rust contract to a public account.

- **Confidential Intents** is **generally available** to developers through the **1Click Swap API**.
- Could be especially useful for **private DeFi** or **prediction-market** infrastructure.

### 13.2 NEAR AI
The AI side of the ecosystem includes:
- AI model and inference infrastructure
- agent deployment tools
- **confidential inference using TEEs**
- agent security and **credential isolation**
- tools for monetising AI services

A relevant project: **IronClaw**.

**Idea:** AI agents that **carry out economic activity**, not just answer prompts.

```
AI Agent
   |
   ├── Researches markets
   |
   ├── Analyses opportunities
   |
   ├── Negotiates with other agents
   |
   ├── Requests payments
   |
   ├── Purchases services
   |
   └── Executes authorised transactions
```

**Agent + restricted account permissions + cross-chain signing + intent-based execution** is a key direction for the ecosystem.

> NEAR AI and NEAR Protocol are **complementary but not the same product**.

---

## 14. Security differences: NEAR vs Solana

Treat NEAR as a **new execution model**, not just a new SDK.

| Topic | What you need to understand |
| --- | --- |
| Authorization | Difference between **signer** and **predecessor** |
| Access keys | Full access vs restricted keys |
| Async execution | Promise execution and callbacks |
| State consistency | What happens between external calls and callbacks |
| Storage | Storage staking and unbounded state growth |
| Token accounting | NEP-141 and storage registration |
| Refunds | Correct handling of failed cross-contract calls |
| Contract upgrades | Preserving existing serialized state |
| Reentrancy-like issues | Repeated calls while promises are pending |
| Front-running | Public transaction visibility and ordering |

### Five security issues to study first

1. **Callback authorization.** A callback must only be callable **by the contract itself**. Otherwise an attacker can call it directly and fake a successful external operation. → Use **`#[private]`**.
2. **Asynchronous state inconsistency.** Your contract is not waiting exclusively for its external call. **Other transactions can run before your callback**, which leads to withdrawal, accounting and state-transition bugs.
3. **Storage exhaustion attacks.** An attacker can keep creating records that consume contract storage. Decide **who pays for storage**.
4. **Refund handling.** When cross-contract operations fail, handle user funds correctly. A failed transfer must **not leave an inconsistent internal balance**.
5. **Function Call Key authorization.** A restricted key only limits **which transactions it can sign**. It doesn't make a badly designed contract safe. **You still need authorization inside the contract.**

Security docs:
- Smart Contract Security Checklist: https://docs.near.org/smart-contracts/security/checklist
- Private Callbacks: https://docs.near.org/smart-contracts/security/cross-contract-calls/callbacks
- Balance Deduction (reentrancy): https://docs.near.org/smart-contracts/security/cross-contract-calls/reentrancy
- Storage Cost Attacks: https://docs.near.org/smart-contracts/security/storage

---

## 15. Full Solana vs NEAR comparison

| Feature | Solana | NEAR |
| --- | --- | --- |
| Architecture | Monolithic L1 execution with parallel transaction processing | Sharded L1 |
| Smart contract language | Rust, C, others via compatible runtimes | Rust/WASM, JavaScript tooling |
| Execution | SVM | WASM runtime |
| State model | Explicit accounts passed to programs | State owned by contract accounts |
| Address model | Public keys and PDAs | Named, implicit and other account IDs |
| Authorization | Signers and account ownership | Multiple permissioned access keys |
| Contract interaction | Synchronous CPI | **Asynchronous** cross-contract calls |
| Internal communication | Instructions and account metas | Actions, receipts and promises |
| Fungible tokens | SPL Token | NEP-141 |
| NFT standard | Token Metadata | NEP-171 |
| Compute resource | Compute Units | Gas / Tgas |
| Data storage economics | Rent-exemption model | Storage staking |
| Native token | SOL | NEAR |
| Consensus | Proof of History-based ordering + PoS consensus | PoS with Doomslug |
| Block timing | ~400 ms target cadence | ~600 ms |
| Finality | Confirmation/finality progression | ~1.2 s deterministic finality |

**Most important differences for app developers:**
1. Account-based contract deployment and persistent state.
2. Permission-scoped access keys.
3. Asynchronous receipt-based communication.
4. Storage staking.
5. Native cross-chain signing infrastructure.

You already know smart contracts, account state, CPI, token mechanics and transaction security. **Your main learning curve is NEAR's execution and account models.**

---

## 16. The hackathon in detail

Theme: **programmable money, AI agents, autonomous economic activity**.

### Prizes

| Prize | Amount |
| --- | --- |
| Total advertised pool | **$250,000** |
| Grand prize | **$55,000** |
| Each of 13 tracks, 1st place | **$10,000** |
| Each of 13 tracks, 2nd place | **$3,000** |
| Each of 13 tracks, 3rd place | **$2,000** |

Prizes are **denominated and paid in NEAR**.

### 16.1 Judges

| Judge | Affiliation |
| --- | --- |
| Illia Polosukhin | NEAR Protocol co-founder |
| Eddy Lazzarin | a16z crypto |
| Mert Mumtaz | Helius |
| Avichal Garg | Electric Capital |
| Kain Warwick | Synthetix and Infinex |
| Haseeb Qureshi | Dragonfly |
| Stepan Gershuni | cyber•Fund |

- **Claude Code and Codex** do the **initial screening**. They check whether your project **actually runs and does what your README claims**.
- **Human judges** make the final decisions.
- Useful judging criteria (based on previous NEAR hackathons): **technical implementation, design, impact, originality, sustainability**.

### 16.2 Rules and submission

| Requirement | Details |
| --- | --- |
| Registration | No advance registration needed to start building |
| Team | Solo or team |
| Maximum projects | Up to **two independent projects per person** |
| Repository | Must be **public** |
| Demo | Public **X post** with video or screenshots |
| Hackathon mention | Say you built it at **NEAR HACKATHON** |
| X tags | **`@NEARProtocol`** and **`#NEARHackathon`** |
| Wallet | **NEAR account address** for payout |
| Project description | **20–2,000 characters** |

- **One submission per project.**
- If you enter two independent projects, **each README must name the other project**.

### Deadlines (India)

| Event | UTC | IST |
| --- | --- | --- |
| Development and submission close | **Nov 14, 2026, 23:59 UTC** | **Nov 15, 2026, 05:29 IST** |
| Results announced | **Nov 18, 2026, 23:59 UTC** | **Nov 19, 2026, 05:29 IST** |

---

## 17. Which track to choose + recommended project

Be strategic. Don't try to cover all 13 tracks or build something that only uses NEAR superficially. **Your advantage:** you already understand Solana's execution model, transactions, smart contracts, DeFi and security.

### Shortlist: three tracks

| # | Track | Fit | What to build |
| --- | --- | --- | --- |
| 1 | **Unstoppable DeFi** | Strong fit | Cross-chain financial apps, trading agents, vaults or exchanges using **NEAR Intents** and **Chain Signatures** |
| 2 | **AI Security & Defense** | Strong fit | Permission-controlled agent wallets, transaction policy engines, secure execution, spending safeguards |
| 3 | **Agent Economy** | | Systems where agents transact, earn, negotiate, buy services and interact with other agents |

### Recommended project: AgentShield, a policy-controlled autonomous Solana trading agent

**Problem:** giving an AI agent unrestricted wallet access is dangerous. You want it to trade, but not with unlimited authority over your assets.

**Solution:** combine **NEAR's authorization system** with **Solana's execution infrastructure**.

#### Proposed architecture

```
1. USER
   Connects NEAR wallet and creates a policy.
        │
        ▼
2. NEAR POLICY CONTRACT
   Stores spending caps, approved programs, slippage limits and expiry.
        │
        ▼
3. AI TRADING AGENT
   Researches markets and proposes transactions.
        │
        ▼
4. POLICY VALIDATION
   Contract checks whether the proposed transaction is permitted.
        │
        ▼
5. CHAIN SIGNATURES
   MPC infrastructure signs an authorised Solana transaction.
        │
        ▼
6. SOLANA EXECUTION
   Signed transaction is submitted to Solana and its result is tracked.
```

#### Features to implement
- [ ] Spending limit per transaction
- [ ] Daily spending limit
- [ ] Approved Solana program IDs
- [ ] Token allowlist
- [ ] Maximum slippage
- [ ] Agent permission expiry
- [ ] Emergency permission revocation
- [ ] Transaction history and policy violations
- [ ] Agent-generated transaction proposals

- Core technologies: **NEAR access-key model + Chain Signatures**.
- Could qualify for **three tracks**: AI Security & Defense, Agent Economy, Unstoppable DeFi.
- **Why this idea:** it's genuinely cross-chain. You use NEAR's authorization and signing to enable a real Solana use case, not just another counter or NFT marketplace.

#### MVP scope
- Start with a **simple SOL transfer on Solana Devnet**, with **policy enforcement + transaction signing**.
- Add **token swaps or NEAR Intents** only after the basic flow works.
- ❌ Don't try to build the full agent economy, trading engine, private execution and cross-chain liquidity stack at once with only a few days.

---

## 18. Developer toolkit

You don't need 20 tools. Start with these:

| Tool | Purpose |
| --- | --- |
| Rust + Cargo | Smart-contract development |
| `cargo-near` | Build and deploy Rust contracts |
| `near-sdk-rs` | Official Rust smart-contract SDK |
| NEAR CLI | Account and network operations |
| NEAR Testnet | Contract deployment and testing |
| NEAR Sandbox | Local blockchain testing |
| `near-api-ts` | TypeScript client |
| `near-api-js` | JavaScript client |
| NEAR Explorer | Inspect transactions and accounts |

The official developer hub provides SDKs, starter templates, faucets and integration resources.

### Useful resources

| Resource | Link | What it's for |
| --- | --- | --- |
| NEAR Documentation | https://docs.near.org/ | Start here: accounts, transactions, smart contracts, protocol architecture |
| Building on NEAR | https://docs.near.org/getting-started/hackathons | Curated SDKs, faucets, templates and hackathon resources |
| HACKATHON.md | https://nearhackathon.com/HACKATHON.md | **Give this to your coding agent.** Event-specific instructions and submission info |
| NEAR Builders | https://nearbuilders.org/build | Builder resources and ecosystem tooling |
| NEAR Playground | https://nearplay.app/ | Try smart contracts without a local setup |
| NEAR Explorer | https://explorer.near.org/ | Inspect transactions and accounts |

### Testnet faucets
- NEAR Testnet Faucet: https://near-faucet.io/
- Circle Faucet (testnet USDC): https://faucet.circle.com/

You **don't need mainnet NEAR** to start experimenting. The hackathon payout form **separately** asks for a NEAR account address.

---

## 19. Learning roadmap

The hackathon closes **Nov 14 UTC**. Don't spend the remaining days reading every protocol doc. **Learn enough to build.**

### NEAR crash course: a practical sequence for a Solana engineer

**Phase 1 · Fundamentals: understand the account model**
- [ ] Create a NEAR account on testnet
- [ ] Understand named and implicit accounts
- [ ] Understand Full Access and Function Call Keys
- [ ] Understand actions and receipts

**Phase 2 · Smart contracts: write Rust contracts**
- [ ] Create a Counter contract
- [ ] Store persistent contract state
- [ ] Implement payable methods and deposits
- [ ] Deploy to testnet

**Phase 3 · Execution model: learn asynchronous contracts**
- [ ] Make a cross-contract call
- [ ] Implement a Promise callback
- [ ] Handle a failed receipt
- [ ] Write a test for a repeated withdrawal attempt

**Phase 4 · Ecosystem: integrate NEAR's unique primitives**
- [ ] Explore NEAR Chain Signatures
- [ ] Understand NEAR Intents
- [ ] Integrate the primitive your project uses

**Phase 5 · Submission: ship your hackathon project**
- [ ] Complete an end-to-end working flow
- [ ] Write tests and a reproducible README
- [ ] Publish your GitHub repository
- [ ] Record your demo and publish the required X post

---

## 20. Docs to read, in order

Don't jump around randomly. Follow this order:

| Order | Documentation | Why |
| --- | --- | --- |
| 1 | [What is NEAR?](https://docs.near.org/getting-started/what-is-near) | General understanding |
| 2 | [Architecture](https://docs.near.org/protocol/network/architecture) | Whole protocol architecture |
| 3 | [Account Model](https://docs.near.org/protocol/accounts-contracts/account-model) | Accounts and keys |
| 4 | [Transactions](https://docs.near.org/protocol/transactions/index) | Actions and transactions |
| 5 | [Transaction Lifecycle](https://docs.near.org/protocol/transactions/transaction-execution) | Receipts and execution |
| 6 | [Cross-Contract Calls](https://docs.near.org/smart-contracts/anatomy/crosscontract) | Promise and callback architecture |
| 7 | [Storage Staking](https://docs.near.org/protocol/storage/storage-staking) | Storage economics |
| 8 | [Chain Signatures](https://docs.near.org/chain-abstraction/chain-signatures) | Cross-chain signing |
| 9 | [NEAR Intents](https://docs.near.org/chain-abstraction/intents/overview) | Solver-based execution |
| 10 | [Security Checklist](https://docs.near.org/smart-contracts/security/checklist) | Contract security |

**Deeper protocol research:**
- NEAR Whitepaper and Nightshade papers: https://www.near.org/papers
- nearcore source code: https://github.com/near/nearcore

---

## 21. Final takeaways

1. **NEAR is not just another Rust blockchain.** Its account model is fundamentally different from Solana's.
2. **The receipt-based asynchronous execution model** is probably the most important technical difference. Understand it before writing any serious DeFi contract.
3. **Function Call Keys** are very useful for session-based apps and autonomous agents, but **the contract must still enforce the business rules**.
4. **Chain Signatures** (cross-chain signing) and **NEAR Intents** (outcome-oriented execution marketplace) are the two key technologies to understand.
5. The hackathon is mainly about **useful financial infrastructure and AI-native apps**. Make one of **NEAR's capabilities essential** to your project.

### Recommended stack to prioritise

```
Rust
  +
NEAR Smart Contracts
  +
Access Keys
  +
Chain Signatures
  +
Solana
  +
AI Agent
```

This uses your existing Solana expertise while teaching you something genuinely new from NEAR.

### README advice (because of AI screening)
The AI screening checks whether the project **works as described**, so write the README as **executable instructions**:
- setup commands
- environment variables
- deployed contract IDs
- expected outputs
- tests

Don't just write a polished project description.

### Next exercise
Build a **small NEAR contract with a restricted Function Call Key**, then add an **asynchronous Promise + callback**. That teaches more about NEAR's execution model than another day of introductory reading.

---

## 22. Sources referenced

Sources the original guide cited (by site):
- **nearhackathon.com**: hackathon site, rules, tracks, HACKATHON.md
- **docs.near.org**: NEAR documentation (accounts, transactions, contracts, security, chain abstraction)
- **near.org**: NEAR official site, blog, roadmap/history, developer hub, papers
- **near.github.io**: Guide to Nearcore Development
- **blog.nearone.org**: Near One Blog (SPICE technical series, Nightshade 3.0)
- **prnewswire.co.uk**: network upgrade 2.13 announcement
- **github.com**: nearcore, near-sdk-rs
- **loops.house**: hackathon prize information
- **nitter (X mirror)**: hackathon track announcements
