# BACKUP POLICY & DATA PROTECTION STANDARD
## Redundant Backup Architecture for IPCR Accomplishment Tracker
**National Irrigation Administration (NIA) - Regional Office XI**

---

## 1. Principles & Objectives

Accomplishment data, daily activity logs, official document registries, and historical IPCR files represent essential public records. To guarantee zero data loss, the system implements a **Dual-Layer Backup Strategy**:

1. **Application Codebase Backup:** Version-controlled through private GitHub repositories with semantic tags and branch protection.
2. **Data & Evidence Backup:** Managed through Google Cloud Firestore managed exports, Google Cloud Storage object versioning, and client-side pre-import snapshot dumps.

---

## 2. Backup Tiers & Cadence

| Tier | Backup Scope | Cadence | Retention | Destination |
|------|--------------|---------|-----------|-------------|
| **Tier A: Source Code** | Application codebase, config, documentation, and build scripts | Every validated commit / release tag | Permanent | GitHub Private Repo |
| **Tier B: Automated Firestore** | All Firestore collections (`commitments`, `activities`, `documents`, etc.) | Daily at 02:00 PHT (UTC+8) | 365 Days | Google Cloud Storage Coldline Bucket |
| **Tier C: Manual Pre-Import** | Full JSON snapshot of all collections before running Excel import wizard | On-demand before import execution | Indefinite until superseded | Local encrypted download + GCS bucket |
| **Tier D: Evidence & Files** | Supporting PDFs, scanned memos, technical calculation files | Continuous versioning on write | Version lifetime + 90 days soft-delete | Firebase Storage with Object Versioning |

---

## 3. Pre-Import Snapshot Requirement

Before executing any historical data import (e.g., importing `SLT-IPCR-2ND-SEM-2026-JULY-DEC 2026-COMMITMENT_r2.xlsx` or `SAM DAILY LOG SHEET.xlsx` in Phase 2):

1. The user will be prompted to generate a **Pre-Import System Snapshot**.
2. The system triggers an atomic read of all active collections and exports a signed, timestamped JSON bundle:
   `backup_pre_import_[YYYY-MM-DD_HHmmss].json`.
3. An entry is written to the `backupRuns` collection with status `SUCCESS` and verified document counts.
4. Only upon successful verification of the snapshot file is the import process unlocked.

---

## 4. Soft-Deletion & Version Audit Trail

Direct permanent deletion of database records is strictly disabled at the application layer:

1. **Soft Delete Flag:**
   When a user removes an activity or document, the system sets `isDeleted: true` and records `deletedAt: [timestamp]`.
2. **Trash / Recovery Bin:**
   Soft-deleted items are excluded from active calculations, IPCR metrics, and reports, but remain retrievable in the **Backup & Audit** module for up to 90 days.
3. **Audit Log Trail:**
   Every modification (create, update, reclassification, soft-delete, report generation) generates an append-only document in `auditLogs` containing:
   - User UID
   - Action type
   - Previous state snapshot (for rollback)
   - Updated state
   - Exact client timestamp (Asia/Manila)

---

## 5. Verification Protocol

> **MANDATORY RULE:** Never mark or claim a backup is successful without programmatic verification.

### Automated Verification Steps:
1. **File Integrity Check:** Ensure backup archive size is non-zero and passes SHA-256 hash checksum calculation.
2. **Schema & Header Verification:** Validate that the exported bundle contains parseable JSON matching the current `schemaVersion`.
3. **Record Count Reconciliation:** Verify that the number of serialized records matches the active document count in Firestore at the moment of snapshot capture.
4. If any check fails, the backup status is recorded as `FAILED`, an alert is displayed on the Dashboard, and the system refuses to proceed with destructive operations.

