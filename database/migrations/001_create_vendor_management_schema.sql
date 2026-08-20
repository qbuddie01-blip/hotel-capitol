-- ============================================================================
-- HOTEL CAPITOL — VENDOR MANAGEMENT SYSTEM (VMS) DATABASE SCHEMA MIGRATION
-- Migration: 001_create_vendor_management_schema.sql
-- Stack: PostgreSQL 14+ / Supabase / Neon / AWS RDS
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Define Custom Enumerated Types (ENUMs)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'supply_capability_enum') THEN
        CREATE TYPE supply_capability_enum AS ENUM (
            'TIER_1_HIGH_VOLUME',
            'TIER_2_SME',
            'LOCAL_ONLY'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'supplier_status_enum') THEN
        CREATE TYPE supplier_status_enum AS ENUM (
            'PENDING',
            'ACTIVE',
            'INACTIVE',
            'BLACKLISTED'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'price_update_status_enum') THEN
        CREATE TYPE price_update_status_enum AS ENUM (
            'PENDING',
            'APPROVED',
            'REJECTED'
        );
    END IF;
END $$;

-- ============================================================================
-- 3. Table: product_categories
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- ============================================================================
-- 4. Table: suppliers
-- ============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL UNIQUE,
    whatsapp_number VARCHAR(50) NOT NULL,
    supply_capability supply_capability_enum NOT NULL,
    status supplier_status_enum NOT NULL DEFAULT 'PENDING',
    is_newly_onboarded BOOLEAN NOT NULL DEFAULT TRUE,
    password_hash VARCHAR(255) NOT NULL,
    force_password_change BOOLEAN NOT NULL DEFAULT TRUE,
    approved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. Table: supplier_categories (Join Table: Many-to-Many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_categories (
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (supplier_id, category_id)
);

-- ============================================================================
-- 6. Table: supplier_products (Catalog)
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    current_price DECIMAL(12, 2) NOT NULL CHECK (current_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- 7. Table: price_update_requests
-- ============================================================================
CREATE TABLE IF NOT EXISTS price_update_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_product_id UUID NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
    proposed_price DECIMAL(12, 2) NOT NULL CHECK (proposed_price >= 0),
    justification TEXT,
    status price_update_status_enum NOT NULL DEFAULT 'PENDING',
    reviewed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. Performance Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers(contact_email);
CREATE INDEX IF NOT EXISTS idx_supplier_categories_supplier ON supplier_categories(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_categories_category ON supplier_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier ON supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_sku ON supplier_products(sku);
CREATE INDEX IF NOT EXISTS idx_price_update_requests_product ON price_update_requests(supplier_product_id);
CREATE INDEX IF NOT EXISTS idx_price_update_requests_status ON price_update_requests(status);
