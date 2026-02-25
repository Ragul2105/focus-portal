# Fund Tracking Portal - ERD and Database Structure

This ERD assumes:
- Email verification is handled by Firebase; the DB stores `firebase_uid`.
- PDFs are stored in S3; the DB stores S3 object metadata.
- Grants flow: Registration -> Grant ID -> Grant Request -> Approvals -> H.O letter.

## ERD (dbdiagram.io / DBML)

```dbml
Table users {
  id uuid [pk]
  firebase_uid varchar [unique, note: "Firebase UID"]
  email varchar [unique]
  full_name varchar
  phone varchar
  department varchar [note: "Staff/HOD only; null for Principal/Institution"]
  is_active boolean
  created_at timestamptz
  updated_at timestamptz
}

Table roles {
  id smallint [pk]
  code varchar [note: "STAFF/HOD/PRINCIPAL/INSTITUTION"]
  name varchar
}

Table user_roles {
  user_id uuid
  role_id smallint
  is_primary boolean
  assigned_by uuid
  assigned_at timestamptz

  Indexes {
    (user_id, role_id) [unique]
  }
}

Table activity_categories {
  id smallint [pk]
  code varchar [note: "IEEE/RND/CLUBS/DEPT/INC/BIS/OTHER"]
  name varchar
  requires_detail boolean
  allows_free_text boolean
}

Table activity_details {
  id uuid [pk]
  category_id smallint
  code varchar [note: "2-4 chars"]
  name varchar
  is_active boolean
}

Table registrations {
  id uuid [pk]
  reg_id varchar [unique, note: "GRYY####"]
  user_id uuid
  applied_as varchar [note: "TEAM/INDIVIDUAL"]
  team_count smallint
  funding_agency varchar [note: "GOV/NON_GOV"]
  funds_from varchar [note: "NATIONAL/INTERNATIONAL"]
  activity_category_id smallint
  activity_detail_id uuid
  activity_detail_text varchar [note: "for OTHER"]
  fund_inr numeric
  fund_usd numeric
  application_number varchar
  applied_date date
  status varchar [note: "DRAFT/SUBMITTED"]
  created_at timestamptz
  updated_at timestamptz
}

Table registration_files {
  id uuid [pk]
  registration_id uuid
  file_type varchar [note: "APPLICATION_FORM/CONFIRMATION_FORM"]
  s3_key varchar
  file_name varchar
  content_type varchar
  size_bytes bigint
  uploaded_at timestamptz
}

Table grant_ids {
  id uuid [pk]
  registration_id uuid
  grant_id varchar [unique, note: "10-digit"]
  request_no varchar [note: "2 digits"]
  scheme_code varchar [note: "2-4 chars"]
  amount_granted_inr numeric
  amount_granted_usd numeric
  generated_by uuid
  generated_at timestamptz
}

Table grant_requests {
  id uuid [pk]
  grant_id_id uuid
  requested_by uuid
  requested_amount_inr numeric
  requested_amount_usd numeric
  status varchar [note: "PENDING/APPROVED/REJECTED"]
  created_at timestamptz
  updated_at timestamptz
}

Table request_files {
  id uuid [pk]
  grant_request_id uuid
  file_type varchar [note: "REQUISITION/AUTHORIZATION"]
  s3_key varchar
  file_name varchar
  content_type varchar
  size_bytes bigint
  uploaded_at timestamptz
}

Table approvals {
  id uuid [pk]
  grant_request_id uuid
  step varchar [note: "HOD/PRINCIPAL"]
  status varchar [note: "PENDING/APPROVED/REJECTED"]
  decided_by uuid
  remarks text
  decided_at timestamptz
}

Table generated_letters {
  id uuid [pk]
  grant_request_id uuid
  letter_type varchar [note: "HO"]
  s3_key varchar
  file_name varchar
  content_type varchar
  size_bytes bigint
  generated_at timestamptz
}

Ref: user_roles.user_id > users.id
Ref: user_roles.role_id > roles.id
Ref: user_roles.assigned_by > users.id

Ref: activity_details.category_id > activity_categories.id
Ref: registrations.user_id > users.id
Ref: registrations.activity_category_id > activity_categories.id
Ref: registrations.activity_detail_id > activity_details.id

Ref: registration_files.registration_id > registrations.id
Ref: grant_ids.registration_id > registrations.id
Ref: grant_ids.generated_by > users.id

Ref: grant_requests.grant_id_id > grant_ids.id
Ref: grant_requests.requested_by > users.id

Ref: request_files.grant_request_id > grant_requests.id
Ref: approvals.grant_request_id > grant_requests.id
Ref: approvals.decided_by > users.id
Ref: generated_letters.grant_request_id > grant_requests.id
```

## Table Details

### USERS
Stores authenticated users. `firebase_uid` is the primary identity from Firebase email verification.
- `id` (UUID, PK)
- `firebase_uid` (string, unique)
- `email` (string, unique)
- `full_name` (string)
- `phone` (string, optional)
- `department` (string, optional; required for staff/HOD, null for principal/institution)
- `is_active` (boolean, default true)
- `created_at`, `updated_at`

### ROLES
System roles.
- `id` (smallint, PK)
- `code` (STAFF, HOD, PRINCIPAL, INSTITUTION)
- `name`

### USER_ROLES
Many-to-many mapping of users to roles.
- `user_id` (FK -> USERS)
- `role_id` (FK -> ROLES)
- `is_primary` (boolean)
- `assigned_by` (FK -> USERS)
- `assigned_at`

### ACTIVITY_CATEGORIES
Top-level category selection.
- `id` (smallint, PK)
- `code` (IEEE, RND, CLUBS, DEPT, INC, BIS, OTHER)
- `name`
- `requires_detail` (true for all except OTHER)
- `allows_free_text` (true only for OTHER)

### ACTIVITY_DETAILS
Category-specific options (IEEE societies, R&D schemes, Clubs, Departments, Incubation, BIS).
- `id` (UUID, PK)
- `category_id` (FK -> ACTIVITY_CATEGORIES)
- `code` (2-4 chars) used in Grant ID
- `name`
- `is_active`

### REGISTRATIONS
Fund registration details.
- `id` (UUID, PK)
- `reg_id` (string, unique) format `GRYY####`
- `user_id` (FK -> USERS)
- `applied_as` (TEAM or INDIVIDUAL)
- `team_count` (required if TEAM)
- `funding_agency` (GOV or NON_GOV)
- `funds_from` (NATIONAL or INTERNATIONAL)
- `activity_category_id` (FK -> ACTIVITY_CATEGORIES)
- `activity_detail_id` (FK -> ACTIVITY_DETAILS, nullable for OTHER)
- `activity_detail_text` (string, used if OTHER)
- `fund_inr` (numeric, required)
- `fund_usd` (numeric, optional)
- `application_number` (string, optional)
- `applied_date` (date)
- `status` (DRAFT or SUBMITTED)
- `created_at`, `updated_at`

### REGISTRATION_FILES
S3 metadata for registration documents.
- `id` (UUID, PK)
- `registration_id` (FK -> REGISTRATIONS)
- `file_type` (APPLICATION_FORM, CONFIRMATION_FORM)
- `s3_key` (string)
- `file_name` (string)
- `content_type` (string)
- `size_bytes` (bigint)
- `uploaded_at`

### GRANT_IDS
Generated activity/grant ID details.
- `id` (UUID, PK)
- `registration_id` (FK -> REGISTRATIONS)
- `grant_id` (string, unique) 10-digit format
- `request_no` (string, 2 digits)
- `scheme_code` (string, 2-4 chars, from Activity Detail)
- `amount_granted_inr` (numeric, optional)
- `amount_granted_usd` (numeric, optional)
- `generated_by` (FK -> USERS)
- `generated_at`

### GRANT_REQUESTS
Grant request after activity/grant ID generation.
- `id` (UUID, PK)
- `grant_id_id` (FK -> GRANT_IDS)
- `requested_by` (FK -> USERS)
- `requested_amount_inr` (numeric, optional)
- `requested_amount_usd` (numeric, optional)
- `status` (PENDING, APPROVED, REJECTED)
- `created_at`, `updated_at`

### REQUEST_FILES
S3 metadata for grant request documents.
- `id` (UUID, PK)
- `grant_request_id` (FK -> GRANT_REQUESTS)
- `file_type` (REQUISITION, AUTHORIZATION)
- `s3_key` (string)
- `file_name` (string)
- `content_type` (string)
- `size_bytes` (bigint)
- `uploaded_at`

### APPROVALS
Approval steps for a grant request.
- `id` (UUID, PK)
- `grant_request_id` (FK -> GRANT_REQUESTS)
- `step` (HOD, PRINCIPAL)
- `status` (PENDING, APPROVED, REJECTED)
- `decided_by` (FK -> USERS)
- `remarks` (text, optional)
- `decided_at`

### GENERATED_LETTERS
Auto-generated H.O letter stored in S3.
- `id` (UUID, PK)
- `grant_request_id` (FK -> GRANT_REQUESTS)
- `letter_type` (HO)
- `s3_key` (string)
- `file_name` (string)
- `content_type` (string)
- `size_bytes` (bigint)
- `generated_at`

## Notes
- R&D and Incubation scheme codes should be finalized and stored in `ACTIVITY_DETAILS.code`.
- Club code format (2-4 chars) can be enforced with a constraint once finalized.
- `amount_granted_inr/usd` can be set when Grant ID is generated or later if needed.
