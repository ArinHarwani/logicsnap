-- supabase/migrations/00001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Projects Table (Host Applications)
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    api_key UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Rules Table (Business Logic)
CREATE TABLE public.rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'draft')),
    rule_schema JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Garbage Data Prevention for Rules
-- Enforce that rule_schema is a valid JSON object containing required structure
ALTER TABLE public.rules ADD CONSTRAINT valid_rule_schema CHECK (
    jsonb_typeof(rule_schema) = 'object' AND
    rule_schema ? 'conditions' AND
    rule_schema ? 'event'
);

-- 3. Historical Events Table (Backtesting Log)
CREATE TABLE public.historical_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES for Performance
CREATE INDEX idx_rules_project_status ON public.rules(project_id, status);
CREATE INDEX idx_historical_events_project_time ON public.historical_events(project_id, created_at DESC);

-- SECURITY: Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_events ENABLE ROW LEVEL SECURITY;

-- Service Roles and Admin isolation (Assume 'authenticated' means edge function server with service_role or validated via api_key)
-- Projects can only read their own project details via API key
CREATE POLICY "Projects isolated by API Key"
    ON public.projects
    FOR SELECT
    USING (api_key::text = current_setting('request.headers')::json->>'x-api-key');

-- Rules are isolated by API key
CREATE POLICY "Rules isolated by project"
    ON public.rules
    FOR ALL
    USING (
        project_id IN (
            SELECT id FROM public.projects 
            WHERE api_key::text = current_setting('request.headers')::json->>'x-api-key'
        )
    );

-- Historical Events isolated by API key
CREATE POLICY "Events isolated by project"
    ON public.historical_events
    FOR ALL
    USING (
        project_id IN (
            SELECT id FROM public.projects 
            WHERE api_key::text = current_setting('request.headers')::json->>'x-api-key'
        )
    );
