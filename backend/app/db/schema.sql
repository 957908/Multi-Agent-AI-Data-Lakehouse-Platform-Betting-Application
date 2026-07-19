CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'analyst', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS platforms (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL, url TEXT NOT NULL, country TEXT, license_status TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS reviews (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), platform_id UUID NOT NULL REFERENCES platforms(id), rating NUMERIC(3,2), content TEXT NOT NULL, source TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS complaints (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), platform_id UUID NOT NULL REFERENCES platforms(id), severity TEXT NOT NULL, content TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS news (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), platform_id UUID REFERENCES platforms(id), title TEXT NOT NULL, url TEXT NOT NULL, published_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS payment_methods (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT UNIQUE NOT NULL, category TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS transactions (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), platform_id UUID REFERENCES platforms(id), payment_method_id UUID REFERENCES payment_methods(id), amount NUMERIC(18,2), currency CHAR(3), created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS embeddings (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), source_table TEXT NOT NULL, source_id UUID NOT NULL, embedding VECTOR(384), created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS agents (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL, status TEXT NOT NULL, last_heartbeat TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS logs (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), level TEXT NOT NULL, message TEXT NOT NULL, context JSONB DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS reports (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL, format TEXT NOT NULL, location TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS analytics (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), platform_id UUID REFERENCES platforms(id), metric TEXT NOT NULL, value NUMERIC NOT NULL, window_start TIMESTAMPTZ, window_end TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS trust_scores (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), platform_id UUID NOT NULL REFERENCES platforms(id), score NUMERIC(5,2) NOT NULL, explanation TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS risk_scores (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), platform_id UUID NOT NULL REFERENCES platforms(id), score NUMERIC(5,2) NOT NULL, risk_level TEXT NOT NULL, explanation TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS platform_statistics (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), platform_id UUID NOT NULL REFERENCES platforms(id), review_count INTEGER DEFAULT 0, complaint_count INTEGER DEFAULT 0, avg_rating NUMERIC(3,2), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE INDEX IF NOT EXISTS idx_platforms_name ON platforms USING btree (name);
CREATE INDEX IF NOT EXISTS idx_reviews_platform_id ON reviews(platform_id);
CREATE INDEX IF NOT EXISTS idx_complaints_platform_id ON complaints(platform_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metric_window ON analytics(metric, window_start, window_end);
