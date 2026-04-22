CREATE TABLE orders (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    client_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL,
    client_json TEXT NOT NULL,
    items_json TEXT NOT NULL,
    shipping_address_json TEXT,
    billing_address_json TEXT,
    payment_method VARCHAR(50),
    notes TEXT,
    tracking_number VARCHAR(120),
    subtotal_ht NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    shipping_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_orders_company_order_number
    ON orders(company_id, order_number);

CREATE INDEX idx_orders_company_created_at
    ON orders(company_id, created_at DESC);

CREATE INDEX idx_orders_company_status
    ON orders(company_id, status);
