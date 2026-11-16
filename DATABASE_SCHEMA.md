# DATABASE SCHEMA & DATA MODEL SPECIFICATION
## Cloud Firestore Architecture for IPCR Accomplishment Tracker
**National Irrigation Administration (NIA) - Regional Office XI**

---

## 1. Schema Conventions & Standard Metadata

All primary root collections are partitioned by user ownership and enforce standard document metadata fields to guarantee multi-layer auditability, schema evolution, and recovery capabilities.

### Mandatory System Fields
Every document in every primary collection includes:
- `id` (string): Unique Firestore document identifier.
- `ownerUid` (string): Firebase Authentication UID of the document owner.
- `createdAt` (timestamp): ISO 8601 string or Firestore Timestamp of creation.
- `updatedAt` (timestamp): ISO 8601 string or Firestore Timestamp of latest mutation.
- `schemaVersion` (number): Version integer (initial: `1`) for schema migrations.
- `isDeleted` (boolean): Soft-delete flag (default: `false`).
- `deletedAt` (timestamp | null): Timestamp when soft deletion occurred.

---

## 2. Firestore Collections Overview

```
firestore/
├── users/{userId}                          # Profile & User settings
├── ipcrCycles/{cycleId}                    # Semiannual / Annual IPCR cycles
├── commitments/{commitmentId}              # Approved IPCR commitments / targets
├── activities/{activityId}                 # Daily logged tasks and outputs
├── documents/{documentId}                  # Digital log of official documents
├── activityLinks/{linkId}                  # N:M relationship between activities & documents
├── projects/{projectId}                    # Irrigation projects & feasibility studies
├── evidence/{evidenceId}                   # Supporting files, memos, photos, references
├── reportRuns/{reportId}                   # Generated accomplishment reports & snapshots
├── auditLogs/{logId}                       # Immutable user and system action logs
└── backupRuns/{backupId}                   # Backup execution records & verification logs
```

---

## 3. Detailed Collection Schemas

### 3.1 `users`
Stores user profile, office designation, and section metadata.
```typescript
interface UserProfile {
  id: string;                      // Matches Firebase Auth UID
  ownerUid: string;
  email: string;
  fullName: string;
  positionTitle: string;           // e.g. "Civil Engineer"
  agency: string;                  // "National Irrigation Administration"
  regionalOffice: string;          // "Regional Office XI"
  division: string;                // "Engineering and Operations Division"
  section: string;                 // "Planning and Design Section"
  immediateSupervisor: string;     // Name and designation of Division Manager / Section Chief
  timezone: string;                // "Asia/Manila"
  preferences: {
    defaultReportingPeriod: 'SEM1' | 'SEM2' | 'Q1' | 'Q2' | 'Q3' | 'Q4';
    notificationsEnabled: boolean;
    autoSaveDrafts: boolean;
  };
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  isDeleted: boolean;
}
```

### 3.2 `ipcrCycles`
Defines the reporting period (e.g., 2026 2nd Semester: July - December 2026).
```typescript
interface IpcrCycle {
  id: string;
  ownerUid: string;
  year: number;                    // e.g. 2026
  cycleType: 'SEM1' | 'SEM2' | 'ANNUAL';
  title: string;                   // "2nd Semester 2026 (July - December 2026)"
  startDate: string;               // "2026-07-01"
  endDate: string;                 // "2026-12-31"
  status: 'DRAFT' | 'ACTIVE' | 'CONCLUDED' | 'ARCHIVED';
  totalCommitments: number;
  sourceWorkbookName?: string;     // "SLT-IPCR-2ND-SEM-2026-JULY-DEC 2026-COMMITMENT_r2.xlsx"
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  isDeleted: boolean;
}
```

### 3.3 `commitments`
Preserves approved IPCR commitments from the official commitment workbook.
```typescript
interface IpcrCommitment {
  id: string;
  ownerUid: string;
  cycleId: string;                 // Foreign key to ipcrCycles
  mfoPap: string;                  // Major Final Output / Program, Activity, Project
  commitmentCode: string;          // Unique code or identifier (e.g. "C-01", "PDE-02")
  successIndicator: string;        // Official success indicator text
  target: string;                  // Target description (e.g. "10 Detailed Engineering Designs")
  numericalTarget: number | null;  // Normalized target value if quantitative
  measurementType: 
    | 'Count' 
    | 'Quantity' 
    | 'Kilometers' 
    | 'Hectares' 
    | 'Percentage' 
    | 'Milestone' 
    | 'Qualitative output';
  allottedBudget: number | null;   // In PHP (null if not specified)
  accountableDivision: string;     // "Planning and Design Section"
  actualAccomplishmentDraft: string; // Baseline / accumulated narrative text
  sourceWorkbook: string;          // Original file name
  sourceCellRef: string;           // Merged cell reference (e.g., "G14:H14")
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  isDeleted: boolean;
}
```

### 3.4 `activities`
Captures daily work items encoded by the user.
```typescript
interface DailyActivity {
  id: string;
  ownerUid: string;
  cycleId: string;
  activityDate: string;            // Format: "YYYY-MM-DD" (Asia/Manila)
  description: string;             // Detailed task description
  output: string;                  // Specific deliverable or milestone accomplished
  category: 
    | 'Technical Review'
    | 'Feasibility Study'
    | 'Detailed Engineering'
    | 'Project Planning'
    | 'Project Monitoring'
    | 'Field Inspection'
    | 'Report Preparation'
    | 'Report Consolidation'
    | 'Document Processing'
    | 'Meetings and Coordination'
    | 'Administrative'
    | 'Other';
  projectId?: string;              // Optional link to projects collection
  timeSpentHours?: number;         // e.g. 3.5 hours
  status: 'DRAFT' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  
  // IPCR Commitment Association
  commitmentId?: string;           // User-confirmed commitment link
  classificationStatus: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'MANUAL';
  
  // AI Assistance Metadata
  aiClassification?: {
    suggestedCommitmentId: string;
    confidenceScore: number;       // 0.0 to 1.0
    rationale: string;
    alternativeSuggestions: Array<{
      commitmentId: string;
      confidenceScore: number;
      reason: string;
    }>;
    missingInformation?: string;
    processedAt: string;
    modelUsed: string;
  };

  remarks?: string;
  isHistorical: boolean;           // True if imported from historical Excel
  sourceSheet?: string;            // e.g., "DAILY LOGSHEET"
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  isDeleted: boolean;
}
```

### 3.5 `documents`
Implements the digital equivalent of the NIA DOC LOG SHEET.
```typescript
interface DocumentRecord {
  id: string;
  ownerUid: string;
  type: string;                    // Incoming / Outgoing / Internal
  documentType: string;            // e.g. "Special Order", "Memorandum", "POW", "Letter"
  meansOfTransmission: string;     // e.g. "Email", "Courier", "Hand Carried", "DMS"
  description: string;
  fileDetail: string;              // Folder / physical file code or digital filename
  dateReceivedByUser: string;      // Format: "YYYY-MM-DD"
  senderSource: string;            // Sender office / entity
  projectId?: string;              // Associated irrigation project
  typeOfStudy?: string;            // e.g. "Feasibility Study", "Detailed Engineering"
  calendarYear: number;
  dateReceived: string;            // Date officially stamped / received
  actionTaken: string;
  dateProcessed?: string;
  status: 'Pending' | 'On-going' | 'Finished' | 'For Follow-up' | 'Cancelled';
  dateFinished?: string;
  remarks?: string;
  followUpAction?: string;
  documentLink?: string;           // Internal or external file link / Storage path
  isHistorical: boolean;
  sourceSheet?: string;            // "DOC LOG SHEET"
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  isDeleted: boolean;
}
```

### 3.6 `activityLinks`
Maintains explicit many-to-many relationships between activities and documents.
```typescript
interface ActivityDocumentLink {
  id: string;
  ownerUid: string;
  activityId: string;
  documentId: string;
  relationshipType: 'SUPPORTING_EVIDENCE' | 'ACTION_TAKEN_ON' | 'REFERENCE';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  isDeleted: boolean;
}
```

### 3.7 `projects`
Tracks NIA irrigation systems, dams, communal irrigation projects (CIS), and studies.
```typescript
interface IrrigationProject {
  id: string;
  ownerUid: string;
  projectName: string;             // e.g. "Digos River Irrigation System Rehabilitation"
  projectType: 'NIS' | 'CIS' | 'SWIP' | 'STUDY' | 'SPECIAL_PROJECT';
  location: {
    province: string;              // e.g. "Davao del Sur"
    municipality: string;
    barangay?: string;
  };
  serviceAreaHectares?: number;
  status: 'PROPOSED' | 'UNDER_STUDY' | 'DETAILED_DESIGN' | 'ONGOING' | 'COMPLETED';
  calendarYear: number;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  isDeleted: boolean;
}
```

### 3.8 `evidence`
Stores file attachments, photos, scan proofs, and technical review sheets.
```typescript
interface SupportingEvidence {
  id: string;
  ownerUid: string;
  activityId?: string;
  documentId?: string;
  commitmentId?: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  storagePath: string;             // Cloud Storage destination path
  downloadUrl?: string;            // Signed or authenticated URL
  fileCategory: 'MEMO' | 'DRAWING' | 'CALCULATION' | 'PHOTO' | 'REPORT' | 'OTHER';
  description?: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  isDeleted: boolean;
}
```

### 3.9 `reportRuns`
Stores generated accomplishment reports, frozen snapshot data, and approval status.
```typescript
interface ReportRun {
  id: string;
  ownerUid: string;
  cycleId: string;
  reportingPeriod: 'SEM1' | 'SEM2' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'CUSTOM';
  periodStartDate: string;
  periodEndDate: string;
  versionNumber: number;           // e.g. 1, 2, 3
  status: 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'EXPORTED';
  generatedDate: string;
  sourceActivityIds: string[];
  consolidatedNarratives: Record<string, { // keyed by commitmentId
    commitmentCode: string;
    mfoPap: string;
    successIndicator: string;
    target: string;
    actualAccomplishmentText: string;
    quantitiesCount: number;
    validatedSupportingDocuments: string[];
    isApprovedByUser: boolean;
  }>;
  exportArtifacts?: {
    excelPath?: string;
    wordPath?: string;
    pdfPath?: string;
  };
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  isDeleted: boolean;
}
```

### 3.10 `auditLogs`
Immutable append-only record of every critical system transaction.
```typescript
interface AuditLogEntry {
  id: string;
  ownerUid: string;
  action: 
    | 'USER_LOGIN'
    | 'ACTIVITY_CREATED'
    | 'ACTIVITY_UPDATED'
    | 'ACTIVITY_DELETED'
    | 'COMMITMENT_CONFIRMED'
    | 'CLASSIFICATION_REJECTED'
    | 'DOCUMENT_CREATED'
    | 'DOCUMENT_UPDATED'
    | 'REPORT_GENERATED'
    | 'REPORT_APPROVED'
    | 'EXPORT_DOWNLOADED'
    | 'BACKUP_CREATED'
    | 'RESTORE_EXECUTED';
  targetCollection: string;
  targetDocumentId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  schemaVersion: number;
}
```

### 3.11 `backupRuns`
Maintains the history and verification check of database and storage backup routines.
```typescript
interface BackupRun {
  id: string;
  ownerUid: string;
  backupType: 'AUTOMATED_DAILY' | 'MANUAL_PRE_IMPORT' | 'ON_DEMAND';
  status: 'SUCCESS' | 'FAILED' | 'VERIFIED';
  storageBucketUri: string;
  totalRecordsCount: number;
  verifiedAt?: string;
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}
```

---

## 4. Firestore Security Rules Blueprint (Planned for Phase 1)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can access, and only their own records
    match /{collection}/{docId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.ownerUid == request.auth.uid) &&
        (request.resource == null || request.resource.data.ownerUid == request.auth.uid);
    }
  }
}
```

