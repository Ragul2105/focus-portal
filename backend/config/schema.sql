-- =============================================================================
--  Focus Grant Management System – PostgreSQL Schema
--  Run once against a clean database:
--    psql -U <user> -d <dbname> -f schema.sql
-- =============================================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
--  ROLES & USERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS roles (
  id    SMALLSERIAL  PRIMARY KEY,
  code  VARCHAR(20)  NOT NULL UNIQUE,   -- STAFF | HOD | PRINCIPAL | INSTITUTION
  name  VARCHAR(100) NOT NULL
);

INSERT INTO roles (code, name) VALUES
  ('STAFF',       'Staff'),
  ('HOD',         'Head of Department'),
  ('PRINCIPAL',   'Principal'),
  ('INSTITUTION', 'Institution')
ON CONFLICT (code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid    VARCHAR(128)  UNIQUE NOT NULL,
  email           VARCHAR(255)  NOT NULL UNIQUE,
  full_name       VARCHAR(255),
  phone           VARCHAR(30),
  department      VARCHAR(255),   -- required for STAFF/HOD; null for PRINCIPAL/INSTITUTION
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_roles (
  user_id     UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  role_id     SMALLINT    NOT NULL REFERENCES roles(id)  ON DELETE CASCADE,
  is_primary  BOOLEAN     NOT NULL DEFAULT FALSE,
  assigned_by UUID        REFERENCES users(id)  ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- =============================================================================
--  ACTIVITY TAXONOMY
-- =============================================================================

CREATE TABLE IF NOT EXISTS activity_categories (
  id                SMALLSERIAL  PRIMARY KEY,
  code              VARCHAR(10)  NOT NULL UNIQUE,   -- e.g. IEEE, RND, CLUBS …
  name              VARCHAR(255) NOT NULL,
  requires_detail   BOOLEAN      NOT NULL DEFAULT TRUE,   -- false only for OTHER
  allows_free_text  BOOLEAN      NOT NULL DEFAULT FALSE   -- true only for OTHER
);

INSERT INTO activity_categories (code, name, requires_detail, allows_free_text) VALUES
  ('IEEE',  'IEEE Activities',        TRUE,  FALSE),
  ('RND',   'Research & Development', TRUE,  FALSE),
  ('CLUBS', 'Technical Clubs',        TRUE,  FALSE),
  ('DEPT',  'Departmental Activities',TRUE,  FALSE),
  ('INC',   'Incubation & Startups',  TRUE,  FALSE),
  ('BIS',   'BIS Activities',         TRUE,  FALSE),
  ('OTHER', 'Other Activities',       FALSE, TRUE)
ON CONFLICT (code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS activity_details (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id   SMALLINT      NOT NULL REFERENCES activity_categories(id) ON DELETE RESTRICT,
  code          VARCHAR(20)   NOT NULL UNIQUE,  -- e.g. IEEETG, RNDGP …
  name          VARCHAR(255)  NOT NULL,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  description   TEXT
);

-- Seed activity details (extend as needed)
INSERT INTO activity_details (category_id, code, name) VALUES
  -- IEEE
  ((SELECT id FROM activity_categories WHERE code='IEEE'), 'IEEETG',  'IEEE Technical Grants'),
  ((SELECT id FROM activity_categories WHERE code='IEEE'), 'IEEESP',  'IEEE Student Paper Contest'),
  -- RND
  ((SELECT id FROM activity_categories WHERE code='RND'),  'RNDGP',   'RND Grant Project'),
  ((SELECT id FROM activity_categories WHERE code='RND'),  'RNDSR',   'RND Sponsored Research'),
  -- CLUBS
  ((SELECT id FROM activity_categories WHERE code='CLUBS'),'CLUBACT', 'Club Activity'),
  ((SELECT id FROM activity_categories WHERE code='CLUBS'),'CLUBWKP', 'Club Workshop'),
  -- DEPT
  ((SELECT id FROM activity_categories WHERE code='DEPT'), 'DEPTSYM', 'Departmental Symposium'),
  ((SELECT id FROM activity_categories WHERE code='DEPT'), 'DEPTCON', 'Departmental Conference'),
  -- INC
  ((SELECT id FROM activity_categories WHERE code='INC'),  'INCPROT', 'Incubation Prototype'),
  ((SELECT id FROM activity_categories WHERE code='INC'),  'INCSTRT', 'Startup Grant'),
  -- BIS
  ((SELECT id FROM activity_categories WHERE code='BIS'),  'BISSTD',  'BIS Standard Activity'),
  -- OTHER
  ((SELECT id FROM activity_categories WHERE code='OTHER'),'OTHGEN',  'General / Other')
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
--  REGISTRATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS registrations (
  id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  reg_id                VARCHAR(20)   NOT NULL UNIQUE,    -- e.g. GR251001
  user_id               UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  applied_as            VARCHAR(10)   NOT NULL DEFAULT 'INDIVIDUAL', -- INDIVIDUAL | TEAM
  team_count            SMALLINT,                                    -- required when TEAM
  funding_agency        VARCHAR(10),                                 -- GOV | NON_GOV
  funds_from            VARCHAR(15),                                 -- NATIONAL | INTERNATIONAL
  activity_category_id  SMALLINT      NOT NULL REFERENCES activity_categories(id),
  activity_detail_id    UUID          REFERENCES activity_details(id),   -- nullable for OTHER
  activity_detail_text  VARCHAR(500),                                -- free text when OTHER
  fund_inr              NUMERIC(14,2),
  fund_usd              NUMERIC(14,2),
  application_number    VARCHAR(100),
  applied_date          DATE,
  status                VARCHAR(20)   NOT NULL DEFAULT 'DRAFT',
                                      -- DRAFT | SUBMITTED | GRANT_ID_ISSUED | COMPLETED | REJECTED
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_user     ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status   ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_category ON registrations(activity_category_id);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS registration_files (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID          NOT NULL REFERENCES registrations(id)  ON DELETE CASCADE,
  field_name      VARCHAR(100)  NOT NULL,   -- applicationForm | confirmationForm
  original_name   VARCHAR(500)  NOT NULL,
  s3_key          TEXT          NOT NULL,
  mime_type       VARCHAR(100),
  size_bytes      BIGINT,
  uploaded_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reg_files_registration ON registration_files(registration_id);

-- =============================================================================
--  GRANT IDs
-- =============================================================================

CREATE TABLE IF NOT EXISTS grant_ids (
  id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id            VARCHAR(30)   NOT NULL UNIQUE,   -- e.g. 25IEEETG01
  registration_id     UUID          NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE RESTRICT,
  request_no          VARCHAR(2)    NOT NULL,           -- 2-digit sequence within scheme
  scheme_code         VARCHAR(10)   NOT NULL,           -- from activity_details.code
  amount_granted_inr  NUMERIC(14,2),
  amount_granted_usd  NUMERIC(14,2),
  generated_by        UUID          NOT NULL REFERENCES users(id),
  generated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grant_ids_registration ON grant_ids(registration_id);

-- =============================================================================
--  GRANT REQUESTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS grant_requests (
  id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id_id           UUID          NOT NULL REFERENCES grant_ids(id) ON DELETE RESTRICT,
  requested_by          UUID          NOT NULL REFERENCES users(id),
  requested_amount_inr  NUMERIC(14,2),
  requested_amount_usd  NUMERIC(14,2),
  status                VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
                                      -- PENDING | HOD_APPROVED | APPROVED | REJECTED
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grant_requests_grant   ON grant_requests(grant_id_id);
CREATE INDEX IF NOT EXISTS idx_grant_requests_status  ON grant_requests(status);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS request_files (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id      UUID          NOT NULL REFERENCES grant_requests(id) ON DELETE CASCADE,
  field_name      VARCHAR(100)  NOT NULL,   -- requisitionLetter | authorizationLetter
  original_name   VARCHAR(500)  NOT NULL,
  s3_key          TEXT          NOT NULL,
  mime_type       VARCHAR(100),
  size_bytes      BIGINT,
  uploaded_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_req_files_request ON request_files(request_id);

-- =============================================================================
--  APPROVALS  (sequential: HOD → PRINCIPAL)
-- =============================================================================

CREATE TABLE IF NOT EXISTS approvals (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  UUID          NOT NULL REFERENCES grant_requests(id) ON DELETE CASCADE,
  approver_id UUID          REFERENCES users(id),
  role        VARCHAR(20)   NOT NULL,    -- HOD | PRINCIPAL
  step        SMALLINT      NOT NULL,    -- 1 = HOD, 2 = PRINCIPAL
  decision    VARCHAR(10),              -- APPROVED | REJECTED  (NULL = pending)
  comments    TEXT,
  decided_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (request_id, step)
);

CREATE INDEX IF NOT EXISTS idx_approvals_request ON approvals(request_id);

-- =============================================================================
--  GENERATED LETTERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS generated_letters (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_request_id UUID         NOT NULL REFERENCES grant_requests(id) ON DELETE CASCADE,
  letter_type      VARCHAR(10)  NOT NULL DEFAULT 'HO',  -- HO (Head Office)
  s3_key           TEXT         NOT NULL,
  file_name        VARCHAR(500),
  content_type     VARCHAR(100),
  size_bytes       BIGINT,
  generated_by     UUID         NOT NULL REFERENCES users(id),
  generated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_letters_request ON generated_letters(grant_request_id);

-- =============================================================================
--  UTILITY: updated_at auto-trigger
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['users', 'registrations', 'grant_requests']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'trg_' || tbl || '_updated_at'
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER trg_%I_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
        tbl, tbl
      );
    END IF;
  END LOOP;
END;
$$;
