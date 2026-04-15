-- Global UMS Setup (lives in public schema)

-- Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS public.permissions (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    module VARCHAR(50)
);

-- Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name)
);

-- Role-Permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id INTEGER REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES public.organizations(id) ON DELETE SET NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    is_super_user BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User-Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Audit Log (Global)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES public.organizations(id),
    user_id INTEGER REFERENCES public.users(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Template for Tenant Schemas (e.g., Raptors)
CREATE SCHEMA IF NOT EXISTS raptors;

-- Athletes
CREATE TABLE IF NOT EXISTS raptors.athletes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available',
    medical_clearance VARCHAR(50) DEFAULT 'cleared',
    load_tolerance VARCHAR(50) DEFAULT 'full',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Athlete Snapshots (Rich Data Model)
CREATE TABLE IF NOT EXISTS raptors.athlete_snapshots (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER REFERENCES raptors.athletes(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    value JSONB NOT NULL, -- Use JSONB to support mixed types (numeric, categorical, text)
    captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Conflict Events
CREATE TABLE IF NOT EXISTS raptors.conflict_events (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER REFERENCES raptors.athletes(id) ON DELETE CASCADE,
    signals_involved JSONB NOT NULL,
    severity VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'open', -- open, dismissed, reviewed, decision_spawned
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Decisions (The Core Workflow)
CREATE TABLE IF NOT EXISTS raptors.decisions (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER REFERENCES raptors.athletes(id) ON DELETE CASCADE,
    conflict_event_id INTEGER REFERENCES raptors.conflict_events(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_review, awaiting_rationale, resolved, escalated
    priority VARCHAR(50) DEFAULT 'normal', -- normal, gameday
    deadline TIMESTAMP WITH TIME ZONE,
    escalation_level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Decision Assignments (Ownership History)
CREATE TABLE IF NOT EXISTS raptors.decision_assignments (
    id SERIAL PRIMARY KEY,
    decision_id INTEGER REFERENCES raptors.decisions(id) ON DELETE CASCADE,
    user_id INTEGER, -- Ref to public.users(id)
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Rationale Records (Structured Human Reasoning)
CREATE TABLE IF NOT EXISTS raptors.rationale_records (
    id SERIAL PRIMARY KEY,
    decision_id INTEGER REFERENCES raptors.decisions(id) ON DELETE CASCADE,
    user_id INTEGER, -- Ref to public.users(id)
    key_factors JSONB, -- Array of strings/objects
    trade_offs TEXT,
    dissenting_views TEXT,
    confidence_level INTEGER, -- 1-5
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications (In-App Store)
CREATE TABLE IF NOT EXISTS raptors.notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- Ref to public.users(id)
    type VARCHAR(50), -- conflict, decision_assigned, escalation
    rel_id INTEGER, -- ID of related entity (decision_id, etc.)
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
