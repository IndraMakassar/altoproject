# Copilot Instructions for nft-claim-poc

## Project Overview

- **Framework:** Next.js 15+ (App Router, TypeScript)
- **Web3 SDK:** Thirdweb v5 (modular, EIP-4337, in-app wallet, gasless)
- **Chain Support:** Multi-chain (Base, Base Sepolia, Polygon, Arbitrum, Optimism, Ethereum)
- **NFT Standard:** ERC1155 ("Black Desert" BBO contract, custom logic)
- **IPFS:** Pinata for metadata, with public gateway fallback

## Key Files & Structure

- `app/page.tsx`: Main NFT claim UI, uses ConnectWalletButton, handles claim, debug, and status logic
- `app/components/ConnectWalletButton.tsx`: Modular ConnectButton, configures wallet options and modal
- `app/nft-preview/page.tsx`: NFT gallery, IPFS gateway tools, NFT visibility debugging
- `lib/thirdweb.ts`: Thirdweb client, chain config, supportedChains export
- `app/layout.tsx`: Provides chain context for dynamic chain switching

## Patterns & Conventions

- **Wallet Connect:** Use `<ConnectWalletButton />` for all wallet interactions. Configure wallets in its file.
- **Chain Selection:** Chain context provided in layout; UI can offer custom chain selector if needed.
- **Gasless:** EIP-4337 smart contract wallet with sponsorGas enabled by default for in-app wallet.
- **Debugging:** Use status state and debug buttons for user-facing error and contract analysis.
- **IPFS Handling:** Always convert IPFS URIs to HTTP using helper in preview page. Avoid direct gateway dependency.
- **No global chains prop:** ThirdwebProvider does not take `chains` prop; chain selection is per ConnectButton/wallet.

## Developer Workflows

- **Dev server:** `npm run dev` (auto port fallback if 3000 in use)
- **Environment:** Set `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` and `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` in `.env.local`
- **Add wallet/chain:** Edit `app/components/ConnectWalletButton.tsx` and `lib/thirdweb.ts`
- **Debug NFT issues:** Use NFT preview page and debug buttons for on-chain and metadata checks

## Integration & Extensibility

- **Add new chain:** Update `supportedChains` in `lib/thirdweb.ts` and ensure wallet supports it
- **Add new wallet:** Add to `wallets` array in ConnectWalletButton
- **Custom modal:** Use ConnectButton's `connectModal` prop for branding/size
- **Gasless config:** Adjust `executionMode` in inAppWallet config

## Examples

- See `app/page.tsx` for claim logic and error handling
- See `app/nft-preview/page.tsx` for IPFS and NFT gallery patterns
- See `app/components/ConnectWalletButton.tsx` for wallet config

---

For any unclear conventions or missing patterns, ask the user for clarification or check recent code in the `app/` and `lib/` folders.
