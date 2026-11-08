# The Entire NEAR Stack — Ecosystem Notes

> **Main point:** NEAR is no longer just a Layer-1 blockchain ecosystem. Today's stack covers **blockchain infrastructure, cross-chain finance, private AI infrastructure, agent runtimes and developer services**.
>
> NEAR's website, GitHub, Developer Hub and hackathon tracks mention dozens of products that look related but solve **completely different problems**. These notes explain them as if we were designing a production application from scratch.
>
> Companion file: [`near.md`](./near.md) (protocol fundamentals).

> ⚠️ **"NEAR Cloud" usually means NEAR AI Cloud (`cloud.near.ai`).** It is **not** a replacement for AWS, Vercel or a NEAR RPC node. It is a cloud platform for **private, verifiable AI inference**.

---

## Table of Contents

1. [The complete NEAR ecosystem map](#1-the-complete-near-ecosystem-map)
2. [NEAR AI Cloud](#2-near-ai-cloud)
3. [IronClaw: secure AI agent runtime](#3-ironclaw-secure-ai-agent-runtime)
4. [Confidential GPU Marketplace](#4-confidential-gpu-marketplace)
5. [OutLayer: verifiable off-chain compute](#5-outlayer-verifiable-off-chain-compute)
6. [Chain Abstraction stack (MPC, Chain Signatures, OmniBridge, Intents)](#6-chain-abstraction-stack)
7. [Other NEAR products (near.com, Agent Market, House of Stake)](#7-other-near-products)
8. [The actual developer stack](#8-the-actual-developer-stack)
9. [RPC, FastNear and data infrastructure](#9-rpc-fastnear-and-data-infrastructure)
10. [Blockchain primitives and standards](#10-blockchain-primitives-and-standards)
11. [The whole stack together: a real application](#11-the-whole-stack-together-a-real-application)
12. [What should you actually use? (decision table)](#12-what-should-you-actually-use)
13. [Things you should NOT confuse](#13-things-you-should-not-confuse)
14. [GitHub repos to study](#14-github-repos-to-study)
15. [Mental model, condensed](#15-mental-model-condensed)
16. [What to learn next: three paths](#16-what-to-learn-next-three-paths)
17. [All links](#17-all-links)
18. [Sources referenced](#18-sources-referenced)

---

## 1. The complete NEAR ecosystem map

**NEAR Stack: open infrastructure for assets, applications and autonomous agents.**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 6. ECONOMIC & GOVERNANCE LAYER                                          │
│    NEAR token · Gas · Storage staking · Validator staking · House of Stake│
├─────────────────────────────────────────────────────────────────────────┤
│ 5. APPLICATIONS & USER EXPERIENCE                                       │
│    near.com ............... Consumer cross-chain interface              │
│    Wallets ................ Identity and signing                        │
│    NEAR Intents integrations Swaps and settlement                       │
│    dApps .................. DeFi, games, commerce                       │
├─────────────────────────────────────────────────────────────────────────┤
│ 4. AI INFRASTRUCTURE  (NEAR AI)                                         │
│    NEAR AI Cloud .......... Private model inference                     │
│    IronClaw ............... Secure agent runtime                        │
│    Confidential GPU ....... TEE-secured AI compute                      │
│    Agent tooling .......... Tools, APIs and integrations                │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. CROSS-CHAIN INFRASTRUCTURE  (Chain Abstraction)                      │
│    Chain Signatures ....... Sign on other chains                        │
│    OmniBridge ............. Cross-chain state and transfers             │
│    NEAR Intents ........... Outcome-oriented execution                  │
│    MPC Network ............ Threshold signing infrastructure            │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. DEVELOPMENT INFRASTRUCTURE                                           │
│    Rust SDK · JS SDK · Cargo NEAR · NEAR CLI · Sandbox · Workspaces ·    │
│    RPC · Indexers                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. BLOCKCHAIN FOUNDATION  (NEAR Protocol)                               │
│    Accounts · Access Keys · Smart Contracts · WASM · Receipts ·          │
│    Nightshade · Validators                                              │
└─────────────────────────────────────────────────────────────────────────┘
```

- This is a **functional map**. It does **not** claim every box is one protocol or run by the same organisation.
  - Some are **first-party products**.
  - Some are **protocol primitives**.
  - Some are **independently operated ecosystem infrastructure**.
- NEAR's **2026 roadmap** ("Building the Agentic Economy") organises its strategy around **cross-chain financial infrastructure** and **autonomous AI agents**.

---

## 2. NEAR AI Cloud

**Private, verifiable AI inference infrastructure.**
Links: [Cloud dashboard](https://cloud.near.ai/) · [Documentation](https://docs.near.ai/)

### 2.1 The problem with normal AI APIs
Suppose you build an AI-powered DeFi app and the user gives your agent:

```
My wallet balance:
$50,000

My current positions:
SOL: $20,000
ETH: $15,000
USDC: $15,000

My trading strategy:
...
```

- Your backend sends this to an AI API, and the prompt is processed on **infrastructure the AI provider runs**.
- Depending on the provider's configuration, **retention policies** and **contract terms**, prompts and responses **may be logged or accessed** by infrastructure operators.
- For a normal chatbot this may be acceptable. It becomes a **serious problem** for an agent handling:
  - private trading strategies
  - financial information
  - personal information
  - API credentials
  - confidential business information
  - proprietary model inputs

### 2.2 What NEAR AI Cloud does
It runs supported AI models inside **Trusted Execution Environments (TEEs)**.

**TEE** = a hardware-isolated environment designed to protect code and data **even from the host OS and the cloud operator**.

NEAR AI Cloud currently describes this setup:
- **Intel TDX** for CPU-side confidential virtualisation
- **NVIDIA Confidential Computing** for GPU-side protection
- **Hardware-backed attestation**
- **Cryptographic response verification**
- **OpenAI-compatible API**

### 2.3 TEE: a simple comparison

**Normal cloud AI:**

```
Your application
       │
       ▼
Cloud provider infrastructure      ← the host is OUTSIDE the model's
       │                             protected execution boundary
       ▼
AI model
```

**TEE-based inference:**

```
Your application
       │
       ▼
┌───────────────────────────────────────────────┐
│ Trusted Execution Environment                 │
│ (hardware isolated)                           │
│ Encrypted memory · Protected inference ·      │
│ Attested workload                             │
│                                               │
│   AI model + your prompt                      │
│   (processed inside the protected boundary)   │
└───────────────────────────────────────────────┘
       │
       ▼
Response + verification evidence
```

**Core idea:** you don't have to **blindly trust** the operator's claim that your computation is private. You can **verify hardware attestation evidence**.

### 2.4 What is attestation?
If NEAR AI Cloud says *"Your AI request was executed inside a protected environment"*, how do you know it's true?

- The **hardware produces a cryptographically signed report** about the running environment.
- The report can identify the **trusted hardware** and **measurements of the software configuration**.
- Your app verifies it against the **hardware manufacturer's trust infrastructure** and the **expected configuration**.

```
AI inference request
       |
       ▼
TEE executes inference
       |
       ▼
Hardware produces evidence
       |
       ▼
Signed attestation report
       |
       ▼
Your verifier checks:
  - Is hardware genuine?
  - Is the quote valid?
  - Does the measurement match?
  - Is the evidence fresh?
       |
       ▼
Accept or reject the evidence
```

NEAR AI publishes **verification tooling and documentation** for this.

> ⚠️ **What a TEE does and doesn't prove:** it proves properties of the **measured execution environment**. It does **not** prove that the model's answer is **factually correct** or that a trading recommendation is **profitable**. You must also verify the **model, code, configuration and evidence** for your security requirements.

### 2.5 How to use it
No special blockchain SDK is needed for inference. It's an **OpenAI-compatible API**.

**Python:**

```python
from openai import OpenAI
import os

client = OpenAI(
    base_url="https://cloud-api.near.ai/v1",
    api_key=os.environ["NEAR_AI_KEY"]
)

response = client.chat.completions.create(
    model="Qwen/Qwen3.8-27B",
    messages=[
        {
            "role": "system",
            "content": "You are a DeFi risk analysis agent."
        },
        {
            "role": "user",
            "content": "Analyze this trading position."
        }
    ]
)

print(response.choices[0].message.content)
```

The official quickstart uses the same approach with the **Python and JavaScript OpenAI clients**.

**Bun / TypeScript backend:**

```ts
import OpenAI from "openai";

const ai = new OpenAI({
  baseURL: "https://cloud-api.near.ai/v1",
  apiKey: process.env.NEAR_AI_KEY,
});

const response = await ai.chat.completions.create({
  model: "Qwen/Qwen3.8-27B",
  messages: [
    {
      role: "system",
      content: "You are a DeFi risk analysis agent.",
    },
    {
      role: "user",
      content: "Analyze this position: 10 SOL long.",
    },
  ],
});

console.log(response.choices[0].message.content);
```

- Base URL: `https://cloud-api.near.ai/v1`
- API key env var used above: `NEAR_AI_KEY`
- NEAR AI provides **inference SDKs for Rust, TypeScript, Python and Go**. The Rust SDK is especially interesting for you.

### 2.6 What you can build

| Application | Why NEAR AI Cloud could help |
| --- | --- |
| Private DeFi agent | Keep user trading strategies confidential |
| Smart contract auditor | Analyse private audit material |
| Trading strategy agent | Protect proprietary strategy inputs |
| Financial assistant | Process sensitive portfolio data |
| Business agent | Process confidential company information |
| Private AI chatbot | Process sensitive user conversations |

💡 **Idea for you:** an **AI security auditor** that processes **unpublished exploit reports and private contract code** through confidential inference.

### 2.7 NEAR AI Cloud is NOT AWS

| Service | What it provides |
| --- | --- |
| AWS EC2 | Virtual machines and general computing |
| AWS S3 | Object storage |
| Vercel | Frontend and serverless application deployment |
| Supabase | Managed database and backend services |
| **NEAR AI Cloud** | **Private, verifiable AI inference** |
| **FastNear** | **NEAR blockchain RPC and indexed data infrastructure** |

NEAR AI Cloud is a **specialised compute service for AI inference**. It does **not** replace frontend hosting, a Postgres database, a general backend server or a blockchain RPC provider.

---

## 3. IronClaw: secure AI agent runtime

**An open-source, security-focused agent operating environment.**
Links: [Website](https://ironclaw.com/) · [GitHub](https://github.com/nearai/ironclaw)

### What is an agent runtime?
You've used coding agents like **OpenCode, Claude Code and Codex**. An LLM alone only takes input and produces output. To make it an **agent** you need:
- a **loop** that decides what to do next
- **tools** it can invoke
- **memory**
- **credentials**
- **file and API access**
- **background execution**
- a **scheduler**
- **permission boundaries**
- **error handling and recovery**

→ That infrastructure is an **agent runtime**.

### 3.1 Why NEAR built IronClaw
Picture giving an autonomous agent access to your financial accounts:

```
SOLANA_PRIVATE_KEY
API_KEY
DATABASE_PASSWORD
WALLET_CREDENTIALS
```

The agent has a model, tools and credentials. What happens when:
- it hits a **malicious webpage**?
- a **tool is compromised**?
- **prompt injection** tricks it into **revealing a secret**?

→ IronClaw is designed to solve this security problem.

### 3.2 How IronClaw works
IronClaw is **written in Rust**.

| Component | Purpose |
| --- | --- |
| Agent loop | Manages the agent's execution |
| Router | Classifies incoming requests |
| Worker | Executes tasks using the LLM |
| **Credential vault** | Keeps secrets away from the model and tools |
| **WASM sandbox** | Runs untrusted tools in isolated environments |
| Tool registry | Manages **native, MCP and WASM** tools |
| **Safety layer** | Detects and mitigates **prompt injection** |
| Scheduler | Runs jobs and routines |
| Workspace | Persistent files and memory |
| Web gateway | Browser-based interface |

### 3.3 Example: an agent with access to your Solana wallet
You give the agent a tool, `execute_solana_swap()`. **The agent doesn't need the raw private key:**

```
                    AI MODEL
                       |
                       |
                  Agent decides
                       |
                       ▼
                 Tool invocation
                       |
                       ▼
                 IronClaw runtime
                       |
              ┌────────┴────────┐
              |                 |
              ▼                 ▼
         WASM Sandbox       Credential Vault
              |                 |
              └────────┬────────┘
                       |
                       ▼
                Approved operation
                       |
                       ▼
                  Solana API
```

- This lowers the chance that **untrusted tools or model-generated content steal credentials**.
- ⚠️ IronClaw **isolates tools and secrets**, but **you still have to design transaction authorization and financial limits correctly**.

### 3.4 MCP's role
IronClaw supports the **Model Context Protocol (MCP)**. With MCP servers for Solana, NEAR, GitHub and market data, IronClaw connects them and exposes them to the agent through its tool architecture:

```
IronClaw
  |
  ├── Solana MCP
  │     ├── Get balance
  │     ├── Read account
  │     └── Build transaction
  │
  ├── NEAR MCP
  │     ├── Read account
  │     ├── Call contract
  │     └── Submit transaction
  │
  └── Market Data MCP
        ├── Get SOL price
        └── Get liquidity data
```

→ Especially useful for autonomous agents that work across **multiple protocols**.

### 3.5 Can you use IronClaw without NEAR?
**Yes.** It's an **open-source agent runtime**, not a smart contract that only runs on NEAR.
- Run it **locally**, or
- deploy it in **NEAR AI Cloud's confidential infrastructure**.

Install on macOS/Linux (from the repo):

```bash
IRONCLAW_RELEASE_TAG=ironclaw-vX.Y.Z

curl --proto '=https' --tlsv1.2 -LsSf \
"https://github.com/nearai/ironclaw/releases/download/${IRONCLAW_RELEASE_TAG}/ironclaw-installer.sh" | sh

ironclaw onboard
```

> Replace `ironclaw-vX.Y.Z` with a **real, available release tag**.

**When to use IronClaw:** when you want a **persistent agent** with access to tools, credentials and external services, and you need **stronger isolation** than a basic LLM-plus-tools setup.

---

## 4. Confidential GPU Marketplace

**A hardware-protected AI compute marketplace** and another part of NEAR AI.

Running a large model is expensive:

```
You want to run a 70B model.

You need:
  - GPU infrastructure
  - Memory
  - Storage
  - Model weights
  - Inference engine
  - Networking
  - Security
```

- You can rent GPUs from cloud providers, but **ordinary GPU hosting doesn't protect you from the operator inspecting memory** while your app runs.
- The Confidential GPU Marketplace offers **confidential compute jobs on TEE-backed infrastructure**.

```
Developer
    |
    | Submit AI workload
    |
    ▼
Confidential GPU Marketplace
    |
    ▼
TEE-secured compute provider
    |
    ▼
Confidential GPU environment
    |
    ├── Load model
    ├── Process input
    └── Generate output
    |
    ▼
Hardware attestation
    |
    ▼
Developer verifies result
```

- Built for organisations that need **private model inference or confidential GPU workloads** without building their own confidential-computing infrastructure.
- Launched by NEAR AI **alongside IronClaw at NEARCON in February 2026**.
- Built on **NEAR DCML**.

### The three AI products compared

| Product | What you use it for |
| --- | --- |
| **NEAR AI Cloud** | Call AI models privately through an API |
| **IronClaw** | Build and run autonomous AI agents |
| **Confidential GPU Marketplace** | Get confidential GPU compute for workloads |

You **can** use all three together, but you don't have to.

---

## 5. OutLayer: verifiable off-chain compute

**Built by FastNear.**
Links: [Website](https://outlayer.fastnear.com/) · [GitHub](https://github.com/fastnear/near-outlayer) · [Docs](https://docs.near.org/primitives/off-chain-compute/outlayer)

Especially interesting for **Rust developers**.

**Why it exists:** smart contracts run in a limited environment. Inside a NEAR contract you **cannot**:
- run arbitrary OS commands,
- make arbitrary HTTP requests,
- run expensive ML operations.

Contracts must be **deterministic** and follow the protocol's execution rules. Heavier work needs **off-chain compute**, for example:
- complex financial calculations
- machine-learning inference
- randomness
- computation that needs an external API
- confidential processing of user data
- computation using external-chain information

### 5.1 How it works
1. Write **normal Rust**, compile to **WASM** with a **WASI target**.
2. The program runs inside an **Intel TDX TEE**.
3. The result includes **evidence binding code + input + output**.

```
NEAR Smart Contract
   Requests an external computation.
        │
        ▼
OutLayer
   Fetches and executes the Rust/WASM workload.
        │
        ▼
Intel TDX enclave
   Runs the application in a hardware-isolated environment.
        │
        ▼
Result + attestation
   Contains evidence about the computation.
        │
        ▼
NEAR contract
   Verifies and uses the returned result.
```

- Contract-integrated work uses NEAR's **`yield` / `resume`** execution flow.
- An **HTTPS API** is also available for direct clients.

### 5.2 Features

| Feature | Meaning | Example |
| --- | --- | --- |
| WASI runtime | Run Rust/WASM workloads | Complex calculations |
| TEE attestation | Prove the workload's execution environment | Verify computation |
| VRF | Verifiable random output | Randomized selection |
| Secrets | Store encrypted credentials | Call private APIs |
| Confidential key derivation | Derive app keys in protected execution | Private key operations |
| MPC vaults | Shared cryptographic key custody | Protected signing |
| Payment Keys | **USDC-based metering** | Charge per compute request |
| Persistent storage | Keep encrypted data between runs | Agent/workload state |

### 5.3 OutLayer vs NEAR AI Cloud

| NEAR AI Cloud | OutLayer |
| --- | --- |
| Mainly **AI inference** infrastructure | **General off-chain compute** infrastructure |
| Use **supported AI models** | Run **custom Rust/WASM** workloads |
| **OpenAI-compatible API** | **WASI execution + HTTPS API** |
| Useful for **LLM applications** | Useful for **computation, VRF, secrets** and other services |
| Built mainly for **AI developers** | Built for **smart-contract developers** and compute workloads |

**Prediction-market example:**
- A confidential model analysing the market → **NEAR AI Cloud**.
- A **verifiable random selection** or a **custom Rust computation requested by your contract** → **OutLayer**.

They're **not competing products**. They solve different problems.

---

## 6. Chain Abstraction stack

The most important technology for **your cross-chain development**. Four components, **related but not interchangeable**:
1. **MPC**
2. **Chain Signatures**
3. **OmniBridge**
4. **NEAR Intents**

### 6.1 MPC Network
**MPC = Multi-Party Computation.** For Chain Signatures, NEAR runs a **distributed threshold-signing system**: signatures are created **without any single participant having the complete private key**.

Example with independent MPC nodes:

```
             Application
                  |
                  ▼
            Signing request
                  |
       ┌──────────┼──────────┐
       |          |          |
       ▼          ▼          ▼
    Node A     Node B     Node C
       |          |          |
       └──────────┼──────────┘
                  |
             Threshold
             signature
                  |
                  ▼
             Target chain
```

- With a **t-of-n** threshold, at least **t** participants are needed to create a valid signature.
- **No single node should hold the full secret key.**
- NEAR's MPC exposes multiple signing algorithms, including **EdDSA** and **ECDSA**.
- **Why:** so a **NEAR smart contract can control an account on another chain** without a traditional **centralised custodian** holding all the private keys.

### 6.2 Chain Signatures
A contract such as `trading.near` needs to execute a transaction on Solana. Instead of keeping a Solana private key on your backend, it **requests a derived MPC signature**. The **derived public key corresponds to an external-chain address**.

```
trading.near
     |
     ▼
Signer contract on NEAR
     |
     ▼
MPC participants
     |
     ▼
Derived Solana public key
     |
     ▼
Sign Solana transaction
     |
     ▼
Broadcast to Solana
```

**One NEAR account → many external keys** via **derivation paths**:

```
Account: trading.near

Derivation paths:
    /users/alice/solana
    /users/bob/solana
    /vaults/treasury/solana
```

- Each path can map to a **different external key**, giving you **account-level cross-chain identities**.

> ⚠️ Chain Signatures are mainly an **outbound signing primitive**: NEAR-controlled logic requests a signature for an external chain. They do **not** automatically give a NEAR contract **reliable access to arbitrary external-chain state**.

Docs: https://docs.near.org/chain-abstraction/chain-signatures

### 6.3 OmniBridge
**Signing a transaction on another chain ≠ bridging assets.**

A bridge has to:
1. **Detect** that an asset transfer happened on the source chain.
2. **Verify** the transfer is genuine.
3. Determine whether it is **final**.
4. **Authorise** the matching action on the destination chain.
5. Handle **withdrawals in the reverse direction**.

→ That is **OmniBridge**. Source code: https://github.com/near-one/omni-bridge

```
Ethereum
   |
   | Transfer ETH/token
   |
   ▼
Bridge verification
   |
   ▼
NEAR
   |
   | Represent / credit asset
   |
   ▼
NEAR application
```

**Trust model by direction:**

| Direction | Mechanism |
| --- | --- |
| **Outbound** (NEAR → other chain) | **Chain Signatures** |
| **Inbound** from **Ethereum, Bitcoin, Zcash** | **Light-client verification** |
| **Inbound** from **Solana, BNB, certain EVM networks** | **Wormhole verification** |

> 🔐 Check the **verification mechanism for the specific route**. **Don't assume every supported chain has the same trust assumptions.**

### 6.4 NEAR Intents
**A universal liquidity and execution protocol**, and one of the most important products in today's ecosystem.
Links: [Website](https://intents.near.org/) · [Developer docs](https://docs.agentsonintents.com/)

Think of Uniswap, Jupiter and cross-chain bridges. A traditional swap needs:
- a source asset
- a destination asset
- a route
- liquidity
- execution transactions
- bridge infrastructure when crossing chains

NEAR Intents hides most of that. You say **what** you want, not **how**:

```
I have:
    1 BTC on Bitcoin

I want:
    USDC on Arbitrum

Recipient:
    My Arbitrum address

Constraints:
    Minimum output
    Deadline
```

→ **Market makers (solvers)** compete to fulfil the request.

#### Infrastructure components

| Component | Responsibility |
| --- | --- |
| User/application | Creates the request |
| **Message Bus** | Distributes quote requests and matched execution messages |
| **Solvers / Market Makers** | Find routes and compete to fulfil requests |
| **1Click API** | Simplifies integration for applications |
| **Verifier contract** | Enforces and settles signed intents |
| **Bridges** | Move or represent external-chain assets |

#### What is `intents.near`?
The **Verifier contract** is deployed at:

```
intents.near
```

- It is the **on-chain settlement layer**.
- **Deposited tokens** are credited to user accounts in the **contract's ledger**.
- **Swaps and transfers** update that ledger.
- **Withdrawals** send assets out through the right **token bridge**.
- Assets are **not** held in a normal company-controlled account. The ledger is **controlled by the relevant signing keys** and **enforced by the verifier**.

#### 1Click Swap API
**Start here as an application developer.** Integrate a **REST API** instead of building the solver network yourself. It handles:
- getting **competitive quotes**
- **creating swap requests**
- **deposit instructions**
- **tracking execution**
- **retry and refund** handling
- optional **fee collection**

SDKs: **TypeScript, Go, Rust**.

```
Your Frontend
     |
     ▼
Your Backend
     |
     ▼
1Click Swap API
     |
     ▼
NEAR Intents solver network
     |
     ▼
Verifier contract
     |
     ▼
Target-chain settlement
```

→ Most apps **don't need to become a solver** or call the Verifier contract directly. **Just integrate the API.**

#### When would you become a solver?
A different path. Suppose you have **excellent liquidity on Solana**. You can build a solver that:
1. receives cross-chain quote requests,
2. calculates execution routes,
3. sources liquidity,
4. submits competitive quotes,
5. fulfils accepted swaps,
6. **earns the spread**.

→ This is not integrating a swap API. You **become part of the execution market**.
See: [Become a NEAR Intents Solver](https://intents.near.org/use-cases/solver)

> 🚨 **Hackathon note:** the Intents **Verifier at `intents.near` is mainnet-only**. The verifier docs list **no equivalent testnet deployment**. Don't build your whole demo on the assumption that a testnet deployment exists. **Check the actual integration and test environment first.**

---

## 7. Other NEAR products

### near.com
[Open application](https://near.com/)
- The **consumer-facing interface** for NEAR's cross-chain stack: one place to use assets across multiple chains.
- **Powered by NEAR Intents.**
- Hides:
  - bridge management
  - different blockchain networks
  - gas-token juggling
  - cross-chain execution complexity
- **Not** a developer framework and **not** a new blockchain. It is a **product that showcases chain abstraction**.

### NEAR AI Agent Market
[Agent Market](https://market.near.ai/)
- A **marketplace where users hire AI agents** to do jobs.

```
Buyer:
    Need a Solana contract security audit.

Agent A:
    Price: 20 NEAR

Agent B:
    Price: 15 NEAR

Agent C:
    Price: 25 NEAR
```

- Agents **offer services, compete for work and get paid**.
- Includes **task descriptions, pricing, payments and reputation** features.
- A practical example of **AI agents taking part in economic activity**, not just producing text.

### NEAR House of Stake
[Governance website](https://houseofstake.org/)
- Part of NEAR's **governance infrastructure**.
- Coordinates **community input and governance decisions** on the **protocol, ecosystem funding and economic parameters**.
- It's the **governance side** of the network, **not** something you import into every dApp.

---

## 8. The actual developer stack

What you actually use in your IDE: what to install, what each tool does, and which belong in production.

### 8.1 Smart contract development (Rust toolchain)

| Tool | Role |
| --- | --- |
| **`near-sdk-rs`** (core SDK) | Write contracts in Rust; access NEAR's runtime, persistent storage, contract environment and APIs |
| **`cargo-near`** | Build, optimise and package contracts into deployable WASM |
| **`near-cli-rs`** | CLI to create accounts, manage keys, deploy contracts, send tokens, inspect transactions |
| **`near-sandbox` / Workspaces** | Local blockchain + integration testing without deploying each test to a public network |

**Basic workflow:**

```bash
# Install NEAR CLI
npm install -g near-cli-rs@latest

# Install the NEAR Cargo extension
cargo install cargo-near

# Create a Rust contract
cargo near new hello-near

cd hello-near

# Compile to WASM
cargo near build

# Run Rust tests
cargo test
```

**Integration testing:**
- [Workspaces for Rust](https://github.com/near/workspaces-rs)
- [Workspaces for JavaScript](https://github.com/near/workspaces-js)
- [NEAR Sandbox Rust](https://github.com/near/sandbox-rs)

→ Unlike plain `cargo test`, integration tests run against a **simulated blockchain**: they **deploy contracts** and run **real transaction workflows**.

**JavaScript smart contracts?** NEAR has JS/TS contract tooling too, but with your Rust experience, **start with `near-sdk-rs`** and understand WASM execution properly first.

Official repos:
- [near-sdk-rs](https://github.com/near/near-sdk-rs)
- [near-sdk-js](https://github.com/near/near-sdk-js)
- [cargo-near](https://github.com/near/cargo-near)

### 8.2 Frontend development
No special framework is needed. Use **React, Next.js, Vite, TypeScript** and the JS tooling you already know.

**`create-near-app`** (starter generator):

```bash
npx create-near-app@latest
```

Scaffolds a Web3 app with a framework such as **React or Next.js**.

**`near-api-js`**: JS library for interacting with the chain:
- reading account information
- calling smart contracts
- constructing transactions
- signing transactions
- sending transactions

**`near-kit`**: a **newer, higher-level**, more ergonomic API library.

**Client libraries listed in current docs:**

| Library | Language |
| --- | --- |
| `near-api-js` | JavaScript/TypeScript |
| `near-kit` | JavaScript/TypeScript (higher-level) |
| `near-api-rs` | Rust |
| `near-kit-rs` | Rust |
| `near-kit-py` | Python |

### 8.3 Wallet infrastructure
Your frontend must **connect to a NEAR account, authenticate the user and request transaction signatures**.

#### A. NEAR Connect (official wallet connector)
[Documentation](https://docs.near.org/tools/near-connect)
- A wallet integration library that supports **different NEAR wallets**.
- Handles:
  - wallet connection
  - user sign-in
  - message signatures
  - transaction signing and submission
- Loads wallet integration code in **isolated sandboxed environments**, which **reduces the supply-chain risk** of bundling every wallet implementation into your app.

#### B. NEAR Auth
- Sign NEAR transactions with familiar **Web2 login**:
  - Google
  - Apple
  - Email
  - Passkeys
- Uses **MPC infrastructure** for accounts and signing.
- Users can sign up with Google **without dealing with seed phrases**, and your app still gives them a **NEAR account and transaction capabilities**.

#### C. Privy
[NEAR + Privy guide](https://docs.near.org/web3-apps/tutorials/privy)
- An **external** wallet and authentication provider.
- Helps with **social login, embedded wallets and onboarding**.
- **Not** a consensus-level NEAR feature.

#### D. Function Call Keys and Gas Keys
- **Protocol-level authorization mechanisms**, unlike frontend wallet connectors.
- Let apps **delegate limited signing authority and gas budgets** to apps or automated processes.
- Especially important for **agent wallets**.

#### E. Meta-transactions (NEP-366)
- A **relayer** submits a signed **delegated transaction** and **pays its gas**.
- Users **don't need to acquire NEAR** for every transaction.
- ⚠️ **Someone still pays the fee.** The relayer takes on that cost.

> 📌 **Recommended learning order:** **NEAR Connect → Function Call Keys → NEAR Auth → meta-transactions.** You'll understand the authorization model much better this way.

---

## 9. RPC, FastNear and data infrastructure

One of the most **overlooked** parts of the stack. A working contract isn't enough; a production dApp must **read chain data efficiently**.

A DEX, for example, has to show:
- user balances
- token holdings
- transaction history
- open orders
- trading volume
- price information
- historical charts
- protocol statistics

You *can* get some of this from raw RPC, but **repeated raw RPC calls are inefficient**. → Understand **RPC vs indexing**.

### 9.1 What is RPC?
**RPC = Remote Procedure Call.** A NEAR RPC provider exposes a **JSON-RPC 2.0** interface to a node.

Typical uses:

```
Get account state
Get contract code
Call a view method
Read a block
Read a transaction
Submit a transaction
Check transaction status
Get validator information
```

Example:

```bash
curl -X POST https://rpc.mainnet.near.org/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "status",
    "method": "status",
    "params": []
  }'
```

→ Returns information about the network.

### 9.2 What is FastNear?
Links: [Official website](https://fastnear.com/) · [API docs](https://docs.fastnear.com/)

Specialised infrastructure for **reliable access to NEAR data and RPC**.

| Service | What it does | When you need it |
| --- | --- | --- |
| NEAR RPC | Blockchain RPC access | Read state and submit transactions |
| FastNear API | Aggregated, indexed data | Wallet balances and assets |
| **NEARDATA** | Block data streaming via REST | Indexers and monitoring |
| Explorer API | Transaction and block lookup | Explorers and transaction history |
| Transfers API | Token-transfer history | Wallet analytics |
| Custom indexers | Tailored blockchain data ingestion | Large applications |

> FastNear is infrastructure from an **ecosystem company**. It is **not** the NEAR consensus protocol. You can build on public RPC, but a production app may benefit from a **dedicated provider**.

### 9.3 What is an indexer?
Your contract emits events:

```
OrderCreated
OrderCancelled
OrderFilled
PositionOpened
PositionClosed
```

Your frontend shouldn't scan every block to rebuild history. **An indexer:**
1. reads blockchain **blocks and execution outcomes**,
2. finds relevant **transactions, receipts and events**,
3. turns them into **app-friendly records**,
4. stores them in a **database**,
5. exposes **APIs** for frontend and backend.

```
              NEAR BLOCKCHAIN
                     |
                     ▼
                  RPC / STREAM
                     |
                     ▼
                   INDEXER
                     |
             ┌───────┴────────┐
             |                |
             ▼                ▼
          PostgreSQL      Analytics DB
             |                |
             ▼                ▼
          Backend          Dashboard
             |
             ▼
          Frontend
```

Not unique to NEAR. Solana has the same split with **Yellowstone gRPC, Geyser, custom indexers and PostgreSQL**.

### 9.4 NEAR's data infrastructure (three categories)

| # | Category | What it is | Good for | Link |
| --- | --- | --- | --- | --- |
| 1 | **Data APIs** | Simple APIs for account assets, transactions, token info and events | Wallets, dashboards | [Data API docs](https://docs.near.org/data-infrastructure/data-api) |
| 2 | **BigQuery Public Dataset** | Historical NEAR data via **SQL**, without storing all history yourself | Research, analytics, protocol dashboards | [Data infrastructure guide](https://docs.near.org/data-infrastructure/what-is) |
| 3 | **Block streams & custom indexers** | Consume blocks and build your own pipeline; NEAR points to **NEARDATA** or the **nearcore indexer** | Custom pipelines | [NEARDATA docs](https://docs.fastnear.com/) |

BigQuery example:

```sql
SELECT *
FROM near_transactions
WHERE ...
```

> 🚨 **NEAR Lake is retired.** Old tutorials may recommend **NEAR Lake** and the **NEAR Lake Framework**, but current official docs say **NEAR Lake has been retired**, and the older **QueryAPI** service is **deprecated**. For new apps, use **NEARDATA** or the **nearcore indexer**. Don't copy old tutorials blindly.

---

## 10. Blockchain primitives and standards

The NEAR equivalent of Solana's building blocks (SPL Token, Token Metadata, Associated Token Accounts, Token Extensions, Pyth, Anchor, Squads, DeFi protocols).

Standards are called **NEPs (NEAR Enhancement Proposals)**.

### 10.1 Token standards

| Standard | What it does | Use it for |
| --- | --- | --- |
| **NEP-141** | Fungible tokens | USDC-like assets |
| **NEP-145** | Token storage management | FT account registration |
| **NEP-148** | Token metadata | Token name, symbol, decimals |
| **NEP-171** | Non-fungible tokens | NFTs |
| **NEP-177** | NFT metadata | NFT descriptions and images |
| **NEP-245** | MultiTokens | Managing multiple fungible/non-fungible token types |
| **NEP-297** | Standardised events | Indexing contract activity |
| **NEP-621** | Tokenized vaults | Standard vault interfaces |

→ These are **interface standards**, not separate blockchains. Compatible contracts interoperate through **common methods**.

### 10.2 Linkdrops and Keypom
Links: [Keypom website](https://keypom.xyz/) · [Keypom GitHub](https://github.com/keypom/keypom)

- A **Linkdrop** distributes **assets and onboarding access through a URL**.
- Example: a game gives new users:
  - a small amount of NEAR
  - an NFT
  - a temporary account key
  - access to a particular app
- Instead of a complicated onboarding flow, **share links that deliver the assets and access**.
- **Keypom** provides infrastructure to **create and manage these drops**.
- Great for onboarding users **unfamiliar with crypto wallets**.

### 10.3 DAOs
NEAR supports DAOs through **smart-contract-based governance**. A DAO can manage:
- membership
- proposals
- voting
- treasury funds
- execution of approved actions

```
Community
    |
    ▼
Create proposal
    |
    ▼
Members vote
    |
    ▼
Voting threshold reached
    |
    ▼
Approved action
    |
    ▼
Treasury / contract execution
```

→ Use a DAO when you need **coordinated, rule-based decision-making** rather than an admin-controlled app.

### 10.4 Oracles
An **oracle** supplies external information to contracts. Example: a lending protocol needs the SOL price, but the contract **can't just make an HTTP request and trust the response**. It needs a mechanism that delivers **verifiable or appropriately trusted** data on-chain.

NEAR docs list:
- **Pyth Network** for price feeds (familiar from Solana)
- **OutLayer's TEE-secured price oracle**

### 10.5 Other primitives

| Primitive | What it does |
| --- | --- |
| Ref Finance | Decentralised exchange infrastructure |
| Liquid staking | Tokenised representation of staked NEAR |
| Tokenised vaults | Standard interfaces for vault-based assets |
| DID:NEAR | Decentralised identifiers |
| SocialDB | On-chain social data such as profiles and posts |
| Lockup contracts | Time-based token vesting and locked balances |
| **Global Contracts** | **Deploy reusable contract code once for multiple accounts** |

→ You don't need all of these for a first project. **Learn the standards your app needs.**

---

## 11. The whole stack together: a real application

**Example: an autonomous cross-chain AI trading app that executes trades on Solana.** An illustrative architecture showing where each NEAR product fits.

```
┌───────────────────────────────────────────────────────────────┐
│ FRONTEND                                                      │
│ Next.js · React · TypeScript · Dashboard                      │
├───────────────────────────────────────────────────────────────┤
│ WALLET & IDENTITY                                             │
│ NEAR Connect / NEAR Auth · NEAR accounts · Access Keys        │
├───────────────────────────────────────────────────────────────┤
│ APPLICATION BACKEND                                           │
│ Bun · TypeScript · APIs · PostgreSQL · Job queue              │
├───────────────────────────────┬───────────────────────────────┤
│ AI INTELLIGENCE               │ POLICY ENGINE                 │
│ IronClaw · NEAR AI Cloud      │ NEAR Rust contract ·          │
│                               │ Access-key restrictions       │
├───────────────────────────────┼───────────────────────────────┤
│ CROSS-CHAIN EXECUTION         │ CROSS-CHAIN LIQUIDITY         │
│ Chain Signatures · MPC Network│ NEAR Intents · OmniBridge     │
├───────────────────────────────┴───────────────────────────────┤
│ SOLANA BLOCKCHAIN                                             │
│ Jupiter / AMMs · SPL Tokens · Solana programs                 │
├───────────────────────────────────────────────────────────────┤
│ SUPPORTING INFRASTRUCTURE                                     │
│ FastNear RPC · NEAR Data APIs · Solana RPC · Indexers ·       │
│ Monitoring · Tests                                            │
└───────────────────────────────────────────────────────────────┘
```

### Full lifecycle

**Step 1: User signs up**
- The user visits the app and authenticates with **NEAR Connect** or **NEAR Auth**.
- **Their NEAR account becomes their app identity.**

**Step 2: User defines permissions**

```
Maximum trade: $100
Daily spending: $500
Allowed chain: Solana
Allowed programs: Approved list
Maximum slippage: 0.5%
Agent expires: 7 days
```

→ The **policy contract stores these constraints**.

**Step 3: AI agent analyses the market**
- **IronClaw** runs the agent workflow.
- It queries your market-data service and asks **NEAR AI Cloud** to process the information.
- The model produces a **proposed trade**.

**Step 4: Policy verification**
- Before execution, the proposed transaction is **checked against the user's permissions**.
- The agent **can't decide to transfer unlimited assets**.

**Step 5: Cross-chain signing**
- Your app **builds a Solana transaction**.
- NEAR-based authorization logic **requests the Chain Signature**.
- The **MPC network** signs for the **derived Solana address**.

**Step 6: Solana transaction submission**
- The signed transaction is broadcast via **Solana RPC**.
- The app **tracks confirmation and the execution outcome**.

**Step 7: Data indexing**
- The backend records the trade and updates trading history.
- **FastNear** serves NEAR-side data; **your own Solana indexer or a Solana data provider** handles Solana-side history.

→ Assets and execution **stay on Solana**, while **NEAR provides cross-chain authorization, AI and coordination**.

> 🔐 **Each component has its own security boundary:**
> - Your contract **can't assume the AI recommendation is valid**.
> - An **MPC signature doesn't prove the Solana trade succeeded**.
> - An **AI attestation doesn't prove the trading policy was enforced correctly**.
>
> **Verify each step independently.**

---

## 12. What should you actually use?

Keep this next to your IDE:

| You want to... | NEAR technology |
| --- | --- |
| Write a smart contract | `near-sdk-rs` |
| Compile Rust to WASM | `cargo-near` |
| Manage accounts and deploy | NEAR CLI |
| Test contracts | Sandbox + Workspaces |
| Connect a frontend wallet | NEAR Connect |
| Use Google/email/passkey onboarding | NEAR Auth |
| Sponsor user gas | Meta-transactions / relayers |
| Build restricted agent permissions | Function Call Keys |
| Read chain state | NEAR RPC |
| Query balances and transfers | FastNear APIs / Data APIs |
| Build a custom indexer | NEARDATA / nearcore indexer |
| Analyse historical data | BigQuery |
| Issue a fungible token | NEP-141 |
| Create NFTs | NEP-171 |
| Get price feeds | Pyth / OutLayer Oracle |
| Call an AI model privately | NEAR AI Cloud |
| Run a secure agent | IronClaw |
| Run custom verifiable computation | OutLayer |
| Sign Solana transactions using NEAR | Chain Signatures |
| Transfer assets cross-chain | OmniBridge |
| Perform cross-chain swaps | NEAR Intents / 1Click API |
| Become a cross-chain market maker | Intents Solver |
| Sell AI agent services | Agent Market |

---

## 13. Things you should NOT confuse

| Common confusion | Correct understanding |
| --- | --- |
| NEAR AI Cloud = NEAR blockchain | ❌ Separate inference infrastructure |
| IronClaw = AI model | ❌ Agent runtime |
| OutLayer = NEAR AI Cloud | ❌ General verifiable off-chain compute |
| Chain Signatures = Bridge | ❌ MPC signing and asset bridging are different |
| OmniBridge = Intents | ❌ Asset transfers vs outcome-based execution |
| RPC = Indexer | ❌ Node interface vs app-oriented indexed data |
| NEAR Connect = Wallet | ❌ It **connects your app to** wallets |
| NEAR Auth = Function Call Key | ❌ Authentication infrastructure vs protocol authorization |
| 1Click = Solver | ❌ A developer integration layer over the intent infrastructure |
| TEE = ZK proof | ❌ Hardware-enforced execution + cryptographic attestation vs zero-knowledge proofs |

---

## 14. GitHub repos to study

To become a **serious NEAR engineer**, not just submit a hackathon project:

| Repo | What to study |
| --- | --- |
| [nearcore](https://github.com/near/nearcore) | Rust implementation of the NEAR blockchain: runtime, consensus, transaction processing, receipts, shard architecture |
| [near-sdk-rs](https://github.com/near/near-sdk-rs) | Contract SDK, macros, persistent storage, callbacks |
| [NEAR MPC](https://github.com/near/mpc) | Threshold signatures, key derivation, the signing network |
| [IronClaw](https://github.com/nearai/ironclaw) | Rust codebase for secure agent execution, tool sandboxes, credential handling, orchestration |
| [OutLayer](https://github.com/fastnear/near-outlayer) | WASM off-chain execution, TEE integration, contract-to-compute communication |
| [NEAR Intents](https://github.com/near/near-intents) | The verifier, intent settlement, the token-accounting model |
| [OmniBridge](https://github.com/near-one/omni-bridge) | Bridge verification and asset-transfer architecture |
| [NEPs](https://github.com/near/NEPs) | Protocol specifications and token standards |

> ⚠️ These are **not all maintained by one organisation**. Check the **repo owner, licence, maintenance status and deployed contract version** before depending on code.

---

## 15. Mental model, condensed

**The NEAR stack in one picture:**

```
┌──────────────────────────────────────────────────────────────┐
│ APPLICATIONS & AUTONOMOUS AGENTS                             │
│ DeFi · Trading · Payments · Commerce · Security · AI         │
├──────────────────────────────────────────────────────────────┤
│ ECONOMIC EXECUTION                                           │
│ Intents · Solvers · Verifier · Agent Market                  │
├──────────────────────────────────────────────────────────────┤
│ CHAIN ABSTRACTION                                            │
│ MPC · Chain Signatures · OmniBridge                          │
├──────────────────────────────────────────────────────────────┤
│ AI STACK                                                     │
│ AI Cloud · IronClaw · Confidential GPUs                      │
├──────────────────────────────────────────────────────────────┤
│ DEVELOPER STACK                                              │
│ SDKs · CLI · RPC · Indexers · Wallets                        │
├──────────────────────────────────────────────────────────────┤
│ NEAR PROTOCOL                                                │
│ Blockchain · Accounts · Smart contracts · State · Consensus  │
└──────────────────────────────────────────────────────────────┘
```

---

## 16. What to learn next: three paths

Don't learn everything at once. There are **three distinct engineering paths**:

| | Path A: NEAR protocol engineer | Path B: NEAR chain-abstraction engineer | Path C: NEAR AI infrastructure engineer |
| --- | --- | --- | --- |
| 1 | nearcore architecture | MPC and threshold cryptography | TEE and confidential computing |
| 2 | Rust WASM runtime | Chain Signatures | IronClaw architecture |
| 3 | Receipts and cross-shard execution | OmniBridge verification | WASM tool isolation |
| 4 | Account model and access keys | NEAR Intents | NEAR AI Cloud and attestation |
| 5 | Runtime and contract security | Cross-chain settlement and solver architecture | Agent permissions and autonomous payments |
| **Best for** | **Protocol-level OSS** | **Cross-chain DeFi** | **Rust + AI systems** |

**Recommendation for you** (Solana + Rust + smart-contract background): **prioritise Path B**, plus **enough of Path C** to build an agent that **safely interacts with financial infrastructure**.

> 🎯 **Biggest recommendation:** don't build a project that uses NEAR **just because the hackathon requires it**. **Pick a NEAR primitive that makes your project genuinely better.**

### Official entry points for further research
These five together cover most of the stack's major engineering directions:
- [NEAR technology stack](https://www.near.org/)
- [Protocol and developer documentation](https://docs.near.org/)
- [NEAR AI Cloud documentation](https://docs.near.ai/)
- [NEAR Intents integration documentation](https://docs.agentsonintents.com/)
- [2026 NEAR roadmap](https://roadmap.near.org/)

---

## 17. All links

**AI**
- NEAR AI Cloud dashboard: https://cloud.near.ai/
- NEAR AI docs: https://docs.near.ai/
- NEAR AI Cloud API base URL: `https://cloud-api.near.ai/v1`
- IronClaw website: https://ironclaw.com/
- IronClaw GitHub: https://github.com/nearai/ironclaw
- NEAR AI Agent Market: https://market.near.ai/

**Off-chain compute**
- OutLayer website: https://outlayer.fastnear.com/
- OutLayer GitHub: https://github.com/fastnear/near-outlayer
- OutLayer on NEAR Docs: https://docs.near.org/primitives/off-chain-compute/outlayer

**Chain abstraction**
- Chain Signatures docs: https://docs.near.org/chain-abstraction/chain-signatures
- NEAR MPC GitHub: https://github.com/near/mpc
- OmniBridge GitHub: https://github.com/near-one/omni-bridge
- NEAR Intents website: https://intents.near.org/
- NEAR Intents developer docs: https://docs.agentsonintents.com/
- Become a Solver: https://intents.near.org/use-cases/solver
- NEAR Intents GitHub: https://github.com/near/near-intents

**Products / governance**
- near.com: https://near.com/
- House of Stake: https://houseofstake.org/

**Developer tooling**
- near-sdk-rs: https://github.com/near/near-sdk-rs
- near-sdk-js: https://github.com/near/near-sdk-js
- cargo-near: https://github.com/near/cargo-near
- Workspaces (Rust): https://github.com/near/workspaces-rs
- Workspaces (JS): https://github.com/near/workspaces-js
- NEAR Sandbox (Rust): https://github.com/near/sandbox-rs
- NEAR Connect: https://docs.near.org/tools/near-connect
- NEAR + Privy guide: https://docs.near.org/web3-apps/tutorials/privy

**Data**
- Public mainnet RPC: https://rpc.mainnet.near.org/
- FastNear: https://fastnear.com/
- FastNear API docs / NEARDATA: https://docs.fastnear.com/
- Data API docs: https://docs.near.org/data-infrastructure/data-api
- Data infrastructure guide: https://docs.near.org/data-infrastructure/what-is

**Primitives**
- Keypom: https://keypom.xyz/
- Keypom GitHub: https://github.com/keypom/keypom
- NEPs: https://github.com/near/NEPs

**Core / general**
- nearcore: https://github.com/near/nearcore
- NEAR: https://www.near.org/
- NEAR docs: https://docs.near.org/
- 2026 roadmap: https://roadmap.near.org/

---

## 18. Sources referenced

Sources the original notes cited (by site):
- **near.ai** / **docs.near.ai**: NEAR AI, NEAR AI Cloud, attestation tooling, SDKs, Confidential GPU Marketplace
- **roadmap.near.org**: "Building the Agentic Economy" 2026 roadmap
- **github.com**: IronClaw, NEAR MPC, Near-One/omni-bridge
- **docs.near.org**: OutLayer, Chain Signatures, Intents, developer tooling, wallets, meta-transactions, RPC, data infrastructure, standards, Keypom, oracles, primitives
- **docs.agentsonintents.com**: NEAR Intents verifier (`intents.near`), 1Click Swap API, mainnet-only note
- **near.org**: near.com, House of Stake
- **fastnear.com**: "High-Performance NEAR Protocol Infrastructure" (FastNear services)
