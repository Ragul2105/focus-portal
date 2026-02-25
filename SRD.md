# Fund Tracking Portal - SRD (Draft)

## 1. Purpose
Track and manage all funds applied/received by staff. This SRD captures the functional scope provided so far.

## 2. In Scope
- Authentication and role-based access (staff, HOD, principal, institution).
- Fund registration and validation.
- Activity/grant ID generation.
- Grant request submission with required uploads.
- Approval workflow (HOD then principal) with status visibility.
- Auto-generation of H.O letter after approvals.

## 3. Out of Scope
- Accounting, disbursement, and financial reconciliation.
- External integrations not specified.

## 4. User Roles
- Staff
- HOD (approver role)
- Principal (final approver)
- Institution user

## 5. Functional Requirements
- See `FEATURES.md` for the detailed feature list, fields, dropdown options, and ID formats.

## 6. Data Requirements
- Registration data, activity details, uploads, approvals, and generated IDs must be stored and auditable.

## 7. Workflows
- Fund registration -> Activity/Grant ID generation -> Grant request -> HOD approval -> Principal approval -> H.O letter generation.

## 8. Notifications
- Email to registered user after Grant ID generation.

## 9. File Uploads
- PDF only for application proof and requisition/authorization letters.
- Max size 10 MB for authorization letter.

## 10. Open Questions
- Final code mapping for R&D and Incubation schemes.
- Exact email template and sender.
- Exact rules for request number incrementing per category.
