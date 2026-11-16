# RECOVERY GUIDE & DISASTER RESTORATION PROCEDURES
## Step-by-Step Recovery Manual for IPCR Accomplishment Tracker
**National Irrigation Administration (NIA) - Regional Office XI**

---

## 1. Disaster Recovery Scenarios

This manual addresses three primary recovery scenarios:

1. **Scenario 1: Accidental Soft-Deletion or Faulty Edit** (Immediate client-side rollback)
2. **Scenario 2: Failed or Corrupted Historical Excel Import** (Reversion to Pre-Import Snapshot)
3. **Scenario 3: Catastrophic Cloud Failure or Complete Data Loss** (Full restore from Cloud Storage archive)

---

## 2. Scenario 1: Restoring Soft-Deleted Records

Because all entities implement soft-deletion (`isDeleted: true`), recovery does not require database downtime:

1. In the application, navigate to **Backup & Audit** > **Trash & Soft-Deleted Items**.
2. Filter by entity type (`Activities`, `Documents`, `Commitments`).
3. Locate the affected record using the search bar or deletion timestamp.
4. Click **Restore Record**.
5. The system flips `isDeleted` to `false`, clears `deletedAt`, and creates an `AUDIT_LOG_ENTRY` documenting the restoration.
6. The restored record immediately re-appears in active views and reports.

---

## 3. Scenario 2: Rollback from Pre-Import Snapshot

If an Excel import in Phase 2 results in misplaced cell mappings, duplicate entries, or invalid dates:

1. Navigate to **Import Data** > **Import History & Rollback**.
2. Select the failed import session.
3. Verify the associated **Pre-Import Backup ID**.
4. Click **Execute Rollback**.
5. The system performs an atomic batch write:
   - Soft-deletes or purges all records tagged with `sourceBatchId == [failed_import_id]`.
   - Re-applies the snapshot states recorded immediately prior to the import.
6. Verify record counts against the verified pre-import audit record.

---

## 4. Scenario 3: Complete Restoration from GCS Cloud Backup

If the production Firestore database is compromised or dropped:

### Step 1: Initialize Staging Recovery Environment
> **CRITICAL RULE:** Never restore backups directly into production without staging verification.

1. Create a dedicated staging Firebase project or staging database instance:
   ```bash
   gcloud firestore databases create --database=staging-recovery --location=asia-southeast1
   ```

### Step 2: Restore Firestore Data into Staging
1. Identify the latest verified backup URI from `gs://[PROJECT_ID]-backups/firestore/`:
   ```bash
   gcloud firestore import gs://[PROJECT_ID]-backups/firestore/2026-11-16T02:00:00_daily --database=staging-recovery
   ```

### Step 3: Run Data Integrity & Record Reconciliation
1. Verify record counts across collections:
   - Commitments count matches approved IPCR targets.
   - Activity count matches historical work logs.
   - Document links resolve correctly without orphaned references.
2. Confirm date timezones remain intact in `Asia/Manila` (PHT).

### Step 4: Promote Staging to Production
1. Once validated by the Civil Engineer, switch application environment variables or perform the verified import into the primary database:
   ```bash
   gcloud firestore import gs://[PROJECT_ID]-backups/firestore/2026-11-16T02:00:00_daily --database=(default)
   ```
2. Run sanity check on the **Dashboard** and **Accomplishment Monitoring** modules.
