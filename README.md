# Transparent Charity Fund

This project tracks charity donations and spending on-chain.

## Stack
- Smart contracts: Solidity + Hardhat
- Frontend: Vite + React + ethers
- Wallet: MetaMask

## Project structure
- `smart-contract`: donation contract, tests, deploy scripts
- `frontend`: donor UI (connect wallet + donate)

## Quick start

### 1) Smart contract setup
```bash
cd smart-contract
copy .env.example .env
npm install
npm run compile
npm run test
```
In `smart-contract/.env`, set:
- `SEPOLIA_RPC_URL` from Alchemy/Infura
- `PRIVATE_KEY` of the deployer wallet (funded with Sepolia ETH)
- `ADMIN_WALLET=0xB6fd17D8FFc5D2B9451Ce698f2fa702A77e1Fccf`

### 2) Local deployment
Terminal 1:
```bash
cd smart-contract
npm run node
```

Terminal 2:
```bash
cd smart-contract
npm run deploy:localhost
```

### 3) Frontend setup
```bash
cd frontend
copy .env.example .env
```
Set `VITE_CONTRACT_ADDRESS` in `frontend/.env` to your deployed contract address.

Then run:
```bash
npm install
npm run dev
```

## MetaMask setup
- Import one account from Hardhat local node private keys.
- Add local network:
  - RPC URL: `http://127.0.0.1:8545`
  - Chain ID: `31337`
  - Currency symbol: `ETH`

## Next improvements
- Add donor approval flow for expenses
- Add expense list UI and stats dashboard
- Add event indexing for richer analytics

## Real Sepolia deployment and presentation flow
1. Deploy contract to Sepolia:
```bash
cd smart-contract
npm run deploy:sepolia
```
2. Copy the deployed contract address from terminal output.
3. Set frontend env:
```bash
cd ../frontend
copy .env.example .env
```
Set `VITE_CONTRACT_ADDRESS=<your-sepolia-contract-address>` in `frontend/.env`.
4. Start frontend:
```bash
npm install
npm run dev
```
5. In MetaMask:
- Switch network to Sepolia
- Use your charity/admin wallet `0xB6fd17D8FFc5D2B9451Ce698f2fa702A77e1Fccf`
6. Demo for presentation:
- Connect wallet
- Make one donation from another wallet/account
- (Admin wallet) create and pay one expense using contract methods
- Show transaction hashes on Etherscan Sepolia as proof of transparency
