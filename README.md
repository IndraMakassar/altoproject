# NFT Claim POC - Modern Web3 Application

A modern NFT claiming application built with **Next.js 15**, **Thirdweb v5**, and **Tailwind CSS**, featuring gasless transactions and a beautiful, responsive UI.

## ✨ Features

- 🚀 **Fast Refresh Disabled** - Stable development experience without refresh loops
- 💰 **Gasless NFT Claims** - Sponsored transactions using Thirdweb's Account Abstraction
- 🎨 **Modern UI/UX** - Beautiful, responsive design with Tailwind CSS
- 📱 **Multi-Wallet Support** - In-app wallet, MetaMask, Trust Wallet
- 🔗 **Multi-Chain Ready** - Base, Ethereum, Polygon, Arbitrum, Optimism
- 🖼️ **NFT Gallery** - View and manage your NFT collection
- 🐛 **Debug Tools** - Built-in contract debugging and testing
- 📊 **TypeScript** - Full type safety throughout the application

## 🏗️ Architecture

### Project Structure (Best Practices)

```
nft-claim-poc/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Main page (uses src/components/HomePage)
│   ├── globals.css          # Global styles with Tailwind
│   └── nft-preview/         # NFT gallery page
├── src/                     # Source code (organized by feature)
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── nft/            # NFT-specific components
│   │   ├── HomePage.tsx     # Main page component
│   │   └── index.ts         # Component exports
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript definitions
│   ├── constants/          # App constants
│   └── utils/              # Utility functions
├── lib/                    # External library configurations
│   └── thirdweb.ts         # Thirdweb client setup
└── public/                 # Static assets
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Thirdweb API key
- NFT contract deployed on Base (or other supported chains)

### Installation

```bash
# Clone and install dependencies
git clone <repository-url>
cd nft-claim-poc
npm install

# Setup environment variables
cp .env.example .env.local
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...your_contract_address
```

### Development

```bash
# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🎨 UI Components

### Design System

- **Colors**: Blue/Indigo gradient theme with dark mode support
- **Typography**: Inter font family for modern, clean text
- **Spacing**: Consistent spacing scale (4px, 8px, 16px, 24px, 32px)
- **Animations**: Subtle fade-in animations and smooth transitions
- **Responsive**: Mobile-first design with breakpoints

## 🔧 Configuration

### Next.js Config (`next.config.ts`)

```typescript
const nextConfig: NextConfig = {
	// Disabled for better Web3 compatibility
	reactStrictMode: false,
};
```

## 🌐 Supported Chains

- **Base Mainnet** (8453)
- **Base Sepolia** (84532) - Testnet
- **Ethereum** (1)
- **Polygon** (137)
- **Arbitrum** (42161)
- **Optimism** (10)

## 📝 Best Practices Implemented

### Code Organization

- ✅ **Separation of Concerns**: UI, business logic, and data separated
- ✅ **Component Composition**: Small, focused, reusable components
- ✅ **Custom Hooks**: Extracted stateful logic for reusability
- ✅ **Type Safety**: Comprehensive TypeScript interfaces

### Performance

- ✅ **React.memo**: Prevent unnecessary re-renders
- ✅ **useCallback**: Stable function references
- ✅ **useMemo**: Expensive computation caching
- ✅ **Code Splitting**: Automatic with Next.js app router

## 📚 Resources

- [Thirdweb Documentation](https://portal.thirdweb.com/)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Base Network](https://base.org/)

---

Built with ❤️ using modern Web3 technologies
