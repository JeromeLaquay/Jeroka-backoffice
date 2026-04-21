-- Publications (sans FK cross-base).
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt VARCHAR(500),
    featured_image TEXT,
    type VARCHAR(50) DEFAULT 'standard',
    status VARCHAR(20) DEFAULT 'draft',
    category VARCHAR(100),
    slug VARCHAR(255) NOT NULL,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (company_id, slug)
);

CREATE INDEX idx_content_publications_company ON publications(company_id);
CREATE INDEX idx_content_publications_status ON publications(status);
CREATE INDEX idx_content_publications_slug ON publications(slug);
