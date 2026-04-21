-- Produits (sans FK cross-base ; company_id logique).
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    sku VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    price_ht DECIMAL(10, 2) NOT NULL DEFAULT 0,
    vat_number DECIMAL(5, 2) DEFAULT 20.00,
    cost_price DECIMAL(10, 2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'pièce',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (company_id, sku)
);

CREATE INDEX idx_catalog_products_company_id ON products(company_id);
CREATE INDEX idx_catalog_products_sku ON products(sku);
CREATE INDEX idx_catalog_products_category ON products(category);
CREATE INDEX idx_catalog_products_is_active ON products(is_active);
