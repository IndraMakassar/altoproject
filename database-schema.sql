-- NFT Fashion Database Schema for Supabase
-- Copy and run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Web2 identity -> Web3 wallet mapping)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    email VARCHAR,
    google_id VARCHAR,
    phone VARCHAR,
    wallet_address VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Voucher codes table
CREATE TABLE voucher_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    code VARCHAR(50) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_by UUID REFERENCES users (id),
    used_at TIMESTAMP,
    product_id VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- NFT claims tracking
CREATE TABLE nft_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES users (id),
    nft_type VARCHAR(20) NOT NULL CHECK (
        nft_type IN ('free', 'voucher', 'paid')
    ),
    token_id BIGINT,
    transaction_hash VARCHAR,
    product_id VARCHAR,
    voucher_code VARCHAR,
    claimed_at TIMESTAMP DEFAULT NOW()
);

-- NFC products (untuk validasi)
CREATE TABLE nfc_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    product_id VARCHAR UNIQUE NOT NULL,
    product_name VARCHAR NOT NULL,
    nfc_tag_id VARCHAR UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_claims_per_user INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_wallet_address ON users (wallet_address);

CREATE INDEX idx_voucher_codes_code ON voucher_codes (code);

CREATE INDEX idx_voucher_codes_is_used ON voucher_codes (is_used);

CREATE INDEX idx_nft_claims_user_id ON nft_claims (user_id);

CREATE INDEX idx_nft_claims_nft_type ON nft_claims (nft_type);

CREATE INDEX idx_nfc_products_nfc_tag_id ON nfc_products (nfc_tag_id);

CREATE INDEX idx_nfc_products_product_id ON nfc_products (product_id);

-- Function to handle voucher claim atomically
CREATE OR REPLACE FUNCTION claim_voucher_nft(
  p_voucher_code VARCHAR,
  p_user_id UUID,
  p_token_id INTEGER,
  p_transaction_hash VARCHAR
) RETURNS VOID AS $$
BEGIN
  -- Update voucher as used
  UPDATE voucher_codes 
  SET is_used = TRUE, used_by = p_user_id, used_at = NOW()
  WHERE code = p_voucher_code AND is_used = FALSE;
  
  -- Check if voucher was actually updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Voucher code not found or already used';
  END IF;
  
  -- Insert NFT claim record
  INSERT INTO nft_claims (user_id, nft_type, token_id, transaction_hash, voucher_code)
  VALUES (p_user_id, 'voucher', p_token_id, p_transaction_hash, p_voucher_code);
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO
    nfc_products (
        product_id,
        product_name,
        nfc_tag_id,
        is_active,
        max_claims_per_user
    )
VALUES (
        '550e8400-e29b-41d4-a716-446655440000',
        'Fashion T-Shirt Premium',
        'NFC123456',
        true,
        1
    ),
    (
        '550e8400-e29b-41d4-a716-446655440001',
        'Fashion Hoodie Limited',
        'NFC789012',
        true,
        1
    ),
    (
        '550e8400-e29b-41d4-a716-446655440002',
        'Fashion Jacket Exclusive',
        'NFC345678',
        true,
        1
    );

-- Insert sample voucher codes for testing
INSERT INTO
    voucher_codes (code, is_used, product_id)
VALUES (
        'FASHION12345678',
        false,
        '550e8400-e29b-41d4-a716-446655440000'
    ),
    (
        'FASHION87654321',
        false,
        '550e8400-e29b-41d4-a716-446655440001'
    ),
    (
        'FASHION11111111',
        false,
        '550e8400-e29b-41d4-a716-446655440002'
    ),
    (
        'FASHION22222222',
        false,
        '550e8400-e29b-41d4-a716-446655440000'
    ),
    (
        'FASHION33333333',
        false,
        '550e8400-e29b-41d4-a716-446655440001'
    );

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE voucher_codes ENABLE ROW LEVEL SECURITY;

ALTER TABLE nft_claims ENABLE ROW LEVEL SECURITY;

ALTER TABLE nfc_products ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to nfc_products" ON nfc_products FOR
SELECT TO authenticated USING (true);

-- Allow service role full access (for API operations)
CREATE POLICY "Allow service role full access to users" ON users FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role full access to voucher_codes" ON voucher_codes FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role full access to nft_claims" ON nft_claims FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role full access to nfc_products" ON nfc_products FOR ALL TO service_role USING (true);