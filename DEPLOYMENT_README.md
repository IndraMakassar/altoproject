# NFT Fashion Backend - Deployment Ready ✅

Project backend untuk sistem NFT Fashion dengan 3 tiers:

- **Free NFT** - Claim via NFC scan
- **Voucher NFT** - Claim via voucher code
- **Paid NFT** - Premium tier dengan Midtrans payment

## 🚀 Quick Test APIs

Setelah setup environment variables, test API endpoints:

```bash
# Test free NFT claim
curl -X POST http://localhost:3000/api/nft/claim-free \
  -H "Content-Type: application/json" \
  -d '{"nfcTagId":"NFC123","userWallet":"0x742d35Cc6265C737536c1C7BF24c00a1CFDC8F68","productId":"550e8400-e29b-41d4-a716-446655440000"}'

# Test voucher validation
curl -X POST http://localhost:3000/api/voucher/validate \
  -H "Content-Type: application/json" \
  -d '{"voucherCode":"FASHION12345678"}'

# Test eligibility check
curl -X POST http://localhost:3000/api/nft/eligibility \
  -H "Content-Type: application/json" \
  -d '{"userWallet":"0x742d35Cc6265C737536c1C7BF24c00a1CFDC8F68"}'

# Get user collection
curl http://localhost:3000/api/collection/0x742d35Cc6265C737536c1C7BF24c00a1CFDC8F68

# Get user activity
curl "http://localhost:3000/api/collection/activity?wallet=0x742d35Cc6265C737536c1C7BF24c00a1CFDC8F68"
```

## 📋 Setup Checklist

### 1. Environment Setup

- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill semua environment variables
- [ ] Setup Supabase database
- [ ] Create 3 Thirdweb contracts
- [ ] Setup admin wallet

### 2. Database Setup (Supabase)

```sql
-- Copy SQL dari BACKEND_ARCHITECTURE.md
-- Run di Supabase SQL Editor
```

### 3. Thirdweb Contracts

- Create 3 ERC1155 contracts via Thirdweb dashboard
- Set contract addresses di environment variables
- Fund admin wallet untuk gas fees

### 4. Test Locally

```bash
npm run dev
# Test semua endpoints dengan curl commands di atas
```

## 🌐 Production Deployment

### Vercel Deployment

1. Push ke GitHub
2. Connect repository di Vercel
3. Add environment variables di Vercel dashboard
4. Deploy!

### Environment Variables di Vercel

```
NEXT_PUBLIC_THIRDWEB_CLIENT_ID
THIRDWEB_SECRET_KEY
NEXT_PUBLIC_FREE_NFT_CONTRACT
NEXT_PUBLIC_VOUCHER_NFT_CONTRACT
NEXT_PUBLIC_PAID_NFT_CONTRACT
NEXT_PUBLIC_CHAIN
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PRIVATE_KEY
MIDTRANS_SERVER_KEY
MIDTRANS_CLIENT_KEY
MIDTRANS_IS_PRODUCTION
```

## 📱 Frontend Integration

Backend ini siap diintegrasikan dengan Figma frontend.

### API Endpoints:

- `POST /api/nft/claim-free` - Claim free NFT via NFC
- `POST /api/nft/claim-voucher` - Claim voucher NFT
- `POST /api/nft/claim-paid` - Claim paid NFT
- `POST /api/nft/eligibility` - Check eligibility
- `POST /api/voucher/validate` - Validate voucher
- `GET /api/collection/[address]` - Get user NFTs
- `GET /api/collection/activity` - Get user activity

### Flow Integration:

1. User scan NFC → redirect ke frontend dengan `?nfc=PRODUCT_ID`
2. Frontend call Thirdweb auth untuk login
3. Frontend call backend APIs untuk claim/validate
4. Frontend show success/error states

## 🎯 Next Steps

1. **Test semua endpoints** dengan data real
2. **Setup production database** di Supabase
3. **Create production contracts** di Thirdweb
4. **Deploy ke Vercel**
5. **Integrate dengan Figma frontend**

---

**Status**: ✅ Backend ready for integration
**Todo**: Frontend integration dari Figma design
