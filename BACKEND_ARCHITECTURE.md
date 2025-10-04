# NFT Fashion Project - Backend Architecture & Deployment Guide

## 🎯 **PROJECT OVERVIEW**

Fashion NFT claiming system dengan 3 tiers:

1. **Free NFT** - Via NFC scan di toko fisik
2. **Voucher NFT** - Via kode voucher dari pembelian fisik
3. **Paid NFT** - Berbayar, requires tier 1 & 2 NFT

**Tech Stack:**

- **Frontend**: React (dari Figma AI) - Repository terpisah
- **Backend**: Next.js 15 API Routes + Thirdweb v5
- **Auth**: Thirdweb Web2 login (Google, Email, Phone)
- **Database**: Supabase (PostgreSQL)
- **Payment**: Midtrans integration (Fiat payment)
- **Deployment**: Vercel Free Tier

**✅ IMPLEMENTATION STATUS:**

- [x] Database schema & Supabase setup
- [x] Free NFT claim via NFC
- [x] Voucher NFT claim system
- [x] Paid NFT with Midtrans integration
- [x] Collection & Activity APIs
- [x] Eligibility checking
- [x] Environment validation
- [x] Ready for frontend integration

---

## 🏗️ **BACKEND ARCHITECTURE**

### **API Routes Structure**

```
app/api/
├── auth/
│   ├── login/route.ts          # Web2 login handling
│   └── profile/route.ts        # User profile management
├── nft/
│   ├── claim-free/route.ts     # NFC-based free claiming
│   ├── claim-voucher/route.ts  # Voucher-based claiming
│   ├── claim-paid/route.ts     # Paid NFT claiming
│   └── eligibility/route.ts    # Check tier 3 eligibility
├── collection/
│   ├── [address]/route.ts      # Get user's NFTs
│   └── activity/route.ts       # Transaction history
├── voucher/
│   ├── validate/route.ts       # Validate voucher code
│   └── generate/route.ts       # Generate voucher codes (admin)
└── webhook/
    └── thirdweb/route.ts       # Thirdweb webhooks
```

### **Database Schema (Supabase)**

```sql
-- Users table (Web2 identity -> Web3 wallet mapping)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR,
  google_id VARCHAR,
  phone VARCHAR,
  wallet_address VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Voucher codes table
CREATE TABLE voucher_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES users(id),
  used_at TIMESTAMP,
  product_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- NFT claims tracking
CREATE TABLE nft_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  nft_type VARCHAR(20) NOT NULL, -- 'free', 'voucher', 'paid'
  token_id BIGINT,
  transaction_hash VARCHAR,
  product_id VARCHAR,
  voucher_code VARCHAR,
  claimed_at TIMESTAMP DEFAULT NOW()
);

-- NFC products (untuk validasi)
CREATE TABLE nfc_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR UNIQUE NOT NULL,
  product_name VARCHAR NOT NULL,
  nfc_tag_id VARCHAR UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  max_claims_per_user INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 **RECOMMENDED TOOLS & PLUGINS**

### **Essential Dependencies**

```json
{
	"dependencies": {
		"thirdweb": "^5.108.1",
		"@supabase/supabase-js": "^2.38.4",
		"zod": "^3.22.4",
		"jose": "^5.1.3",
		"nanoid": "^5.0.4",
		"date-fns": "^2.30.0"
	},
	"devDependencies": {
		"@types/node": "^20",
		"prisma": "^5.7.1",
		"@prisma/client": "^5.7.1"
	}
}
```

### **Utility Tools**

1. **Zod** - Schema validation untuk API requests
2. **Prisma** - Database ORM (alternative ke Supabase client)
3. **Jose** - JWT handling untuk custom auth
4. **Nanoid** - Generate unique voucher codes
5. **Date-fns** - Date manipulation

### **Next.js Specific**

```json
{
	"scripts": {
		"dev": "next dev --turbopack",
		"build": "next build --turbopack",
		"start": "next start",
		"db:generate": "prisma generate",
		"db:push": "prisma db push"
	}
}
```

---

## 🚀 **VERCEL DEPLOYMENT GUIDE**

### **Step 1: Prepare Environment Variables**

```bash
# .env.local (development)
# .env.production (Vercel)

# Thirdweb
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
THIRDWEB_SECRET_KEY=your_secret_key

# Database (Supabase)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Contract Addresses
NEXT_PUBLIC_FREE_NFT_CONTRACT=0x...
NEXT_PUBLIC_VOUCHER_NFT_CONTRACT=0x...
NEXT_PUBLIC_PAID_NFT_CONTRACT=0x...

# Chain Configuration
NEXT_PUBLIC_CHAIN=base-sepolia  # atau base untuk mainnet

# Admin
ADMIN_SECRET_KEY=your_admin_secret
```

### **Step 2: Vercel Configuration**

```json
// vercel.json
{
	"framework": "nextjs",
	"buildCommand": "npm run build",
	"devCommand": "npm run dev",
	"installCommand": "npm install",
	"functions": {
		"app/api/**/*.ts": {
			"maxDuration": 30
		}
	},
	"env": {
		"NEXT_PUBLIC_THIRDWEB_CLIENT_ID": "@thirdweb_client_id",
		"THIRDWEB_SECRET_KEY": "@thirdweb_secret_key"
	}
}
```

### **Step 3: Deployment Steps**

#### **Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add THIRDWEB_SECRET_KEY
vercel env add DATABASE_URL
# ... tambahkan semua env vars
```

#### **Via GitHub Integration**

1. Push code ke GitHub repository
2. Connect repository di Vercel dashboard
3. Set environment variables di Vercel dashboard
4. Deploy otomatis setiap push ke main branch

### **Step 4: Database Setup (Supabase)**

```bash
# Install Supabase CLI
npm install -g supabase

# Login dan link project
supabase login
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

### **Step 5: Post-Deployment Checklist**

- [ ] Test API endpoints dengan Postman/Thunder Client
- [ ] Verify database connections
- [ ] Test Thirdweb contract interactions
- [ ] Check environment variables
- [ ] Verify CORS settings
- [ ] Test webhook endpoints

---

## 📱 **API TESTING STRATEGY**

### **Thunder Client / Postman Collections**

```json
// Free NFT Claim Test
POST https://your-app.vercel.app/api/nft/claim-free
Content-Type: application/json

{
  "nfcTagId": "NFC123456",
  "userWallet": "0x...",
  "productId": "SHIRT001"
}
```

### **Command Line Testing**

```bash
# Test free NFT claim
curl -X POST https://your-app.vercel.app/api/nft/claim-free \
  -H "Content-Type: application/json" \
  -d '{"nfcTagId":"NFC123456","userWallet":"0x...","productId":"SHIRT001"}'

# Test voucher validation
curl -X POST https://your-app.vercel.app/api/voucher/validate \
  -H "Content-Type: application/json" \
  -d '{"voucherCode":"FASHION2024","userWallet":"0x..."}'
```

---

## 🔄 **INTEGRATION FLOW**

### **1. NFC Scan Flow**

```
User scans NFC →
Redirect to https://your-app.com/claim?nfc=PRODUCT123 →
Check if logged in →
If not: Thirdweb Web2 login →
Create/get wallet →
Call /api/nft/claim-free →
Mint NFT →
Show success page
```

### **2. Voucher Flow**

```
User buys physical item →
Gets voucher code →
Goes to website →
Login →
Enter voucher code →
Call /api/voucher/validate →
Call /api/nft/claim-voucher →
Mint NFT
```

### **3. Paid NFT Flow**

```
User wants tier 3 NFT →
Call /api/nft/eligibility →
Check ownership of tier 1 & 2 →
If eligible: show payment →
Process payment →
Call /api/nft/claim-paid →
Mint NFT
```

---

## 💰 **VERCEL FREE TIER LIMITATIONS & OPTIMIZATION**

### **Limitations**

- **Function timeout**: 10 seconds (Hobby), 30 seconds (Pro)
- **Bandwidth**: 100GB/month
- **Function invocations**: 125,000/month
- **Edge functions**: 500,000 invocations/month

### **Optimization Strategies**

1. **Use Edge Runtime** untuk lightweight APIs
2. **Cache responses** dengan Vercel KV (Redis)
3. **Optimize images** dengan Next.js Image component
4. **Use ISR** untuk static content yang jarang berubah
5. **Database connection pooling**

### **Cost-Effective Architecture**

```typescript
// Use Edge Runtime untuk fast responses
export const runtime = "edge";

// Cache responses
export async function GET() {
	const cached = await redis.get("nft-data");
	if (cached) return Response.json(cached);

	// Fetch fresh data
	const data = await fetchNFTData();
	await redis.setex("nft-data", 300, data); // Cache 5 minutes

	return Response.json(data);
}
```

---

## 🎯 **NEXT STEPS**

1. **Jawab pertanyaan klarifikasi** di atas
2. **Setup database schema** (Supabase/PlanetScale)
3. **Create Thirdweb contracts** untuk 3 tiers NFT
4. **Implement API routes** sesuai flow yang dijelaskan
5. **Test dengan command line/Postman**
6. **Deploy ke Vercel**
7. **Integrate dengan frontend** dari Figma

Setelah Anda jawab pertanyaan klarifikasi, saya akan mulai implement backend structure yang sesuai dengan kebutuhan spesifik Anda!
