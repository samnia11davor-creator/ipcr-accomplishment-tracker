// ============================================================================
// IPCR Accomplishment Tracker - Domain Type Definitions
// National Irrigation Administration (NIA) - Regional Office XI
// ============================================================================

export type PhilippineTimezone = 'Asia/Manila';

// ---------------------------------------------------------------------------
// Base Metadata for all persistent entities
// ---------------------------------------------------------------------------
export interface BaseEntity {
  id: string;
  ownerUid: string;
  createdAt: string;       // ISO 8601 string
  updatedAt: string;       // ISO 8601 string
  schemaVersion: number;
  isDeleted: boolean;
  deletedAt?: string | null;
}

// ---------------------------------------------------------------------------
// 1. User & Office Profile
// ---------------------------------------------------------------------------
export interface UserProfile extends BaseEntity {
  email: string;
  fullName: string;
  positionTitle: string;
  agency: string;
  regionalOffice: string;
  division: string;
  section: string;
  immediateSupervisor: string;
  supervisorPosition: string;
  timezone: PhilippineTimezone;
  preferences: {
    defaultReportingPeriod: ReportingPeriod;
    notificationsEnabled: boolean;
    autoSaveDrafts: boolean;
  };
}

// ---------------------------------------------------------------------------
// 2. IPCR Cycle
// ---------------------------------------------------------------------------
export type ReportingPeriod = 'SEM1' | 'SEM2' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'CUSTOM';
export type CycleStatus = 'DRAFT' | 'ACTIVE' | 'CONCLUDED' | 'ARCHIVED';

export interface IpcrCycle extends BaseEntity {
  year: number;
  cycleType: 'SEM1' | 'SEM2' | 'ANNUAL';
  title: string;
  startDate: string;       // YYYY-MM-DD
  endDate: string;         // YYYY-MM-DD
  status: CycleStatus;
  totalCommitments: number;
  sourceWorkbookName?: string;
}

// ---------------------------------------------------------------------------
// 3. IPCR Commitment
// ---------------------------------------------------------------------------
export type MeasurementType =
  | 'Count'
  | 'Quantity'
  | 'Kilometers'
  | 'Hectares'
  | 'Percentage'
  | 'Milestone'
  | 'Qualitative output';

export interface IpcrCommitment extends BaseEntity {
  cycleId: string;
  mfoPap: string;
  commitmentCode: string;
  successIndicator: string;
  target: string;
  numericalTarget: number | null;
  measurementType: MeasurementType;
  allottedBudget: number | null;
  accountableDivision: string;
  actualAccomplishmentDraft: string;
  sourceWorkbook: string;
  sourceCellRef: string;   // e.g. "G14:H14"
  isActive: boolean;
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// 4. Daily Activities
// ---------------------------------------------------------------------------
export type ActivityCategory =
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

export type ActivityStatus = 'DRAFT' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type ClassificationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'MANUAL';

export interface AiClassificationSuggestion {
  suggestedCommitmentId: string;
  confidenceScore: number; // 0 to 1
  rationale: string;
  alternativeSuggestions: Array<{
    commitmentId: string;
    confidenceScore: number;
    reason: string;
  }>;
  missingInformation?: string;
  processedAt: string;
  modelUsed: string;
}

export interface DailyActivity extends BaseEntity {
  cycleId: string;
  activityDate: string;    // YYYY-MM-DD (Asia/Manila)
  description: string;
  output: string;
  category: ActivityCategory;
  projectId?: string;
  projectName?: string;
  project?: string;
  timeSpentHours?: number;
  status: ActivityStatus;
  commitmentId?: string;
  classificationStatus: ClassificationStatus;
  aiClassification?: AiClassificationSuggestion;
  remarks?: string;
  isHistorical: boolean;
  sourceSheet?: string;
  supportingDocumentCount?: number;
}

// ---------------------------------------------------------------------------
// 5. Document Monitoring (Mirroring NIA DOC LOG SHEET)
// ---------------------------------------------------------------------------
export type DocumentStatus =
  | 'Pending'
  | 'On-going'
  | 'Finished'
  | 'For Follow-up'
  | 'Cancelled';

export interface DocumentRecord extends BaseEntity {
  type: string;                    // Incoming / Outgoing / Internal
  documentType: string;            // e.g. Special Order, Memorandum, POW, Letter
  meansOfTransmission: string;     // Courier, Email, Hand Carried, DMS
  description: string;
  fileDetail: string;              // Folder / physical file code or digital filename
  dateReceivedByUser: string;      // YYYY-MM-DD
  senderSource: string;
  projectId?: string;
  projectName?: string;
  project?: string;
  typeOfStudy?: string;            // Feasibility Study, Detailed Engineering, etc.
  calendarYear: number;
  dateReceived: string;            // Officially stamped date
  actionTaken: string;
  dateProcessed?: string;
  status: DocumentStatus;
  dateFinished?: string;
  remarks?: string;
  followUpAction?: string;
  documentLink?: string;
  isHistorical: boolean;
  sourceSheet?: string;
}

// ---------------------------------------------------------------------------
// 6. Activity - Document Association
// ---------------------------------------------------------------------------
export interface ActivityDocumentLink extends BaseEntity {
  activityId: string;
  documentId: string;
  relationshipType: 'SUPPORTING_EVIDENCE' | 'ACTION_TAKEN_ON' | 'REFERENCE';
  notes?: string;
}

// ---------------------------------------------------------------------------
// 7. Projects
// ---------------------------------------------------------------------------
export interface IrrigationProject extends BaseEntity {
  projectName: string;
  projectType: 'NIS' | 'CIS' | 'SWIP' | 'STUDY' | 'SPECIAL_PROJECT';
  locationProvince: string;
  locationMunicipality: string;
  serviceAreaHectares?: number;
  status: 'PROPOSED' | 'UNDER_STUDY' | 'DETAILED_DESIGN' | 'ONGOING' | 'COMPLETED';
  calendarYear: number;
}

// ---------------------------------------------------------------------------
// 8. Accomplishment Reports
// ---------------------------------------------------------------------------
export type ReportStatus = 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'EXPORTED';

export interface ReportCommitmentNarrative {
  commitmentId: string;
  commitmentCode: string;
  mfoPap: string;
  successIndicator: string;
  target: string;
  measurementType: MeasurementType;
  actualAccomplishmentText: string;
  quantitiesCount: number;
  activitiesCount: number;
  supportingDocuments: string[];
  isApprovedByUser: boolean;
  userEditedNarrative?: string;
}

export interface ReportRun extends BaseEntity {
  cycleId: string;
  reportingPeriod: ReportingPeriod;
  periodStartDate: string;
  periodEndDate: string;
  versionNumber: number;
  status: ReportStatus;
  generatedDate: string;
  sourceActivityIds: string[];
  commitmentsSummary: Record<string, ReportCommitmentNarrative>;
  exportArtifacts?: {
    excelPath?: string;
    wordPath?: string;
    pdfPath?: string;
  };
}

// ---------------------------------------------------------------------------
// 9. Audit Logs & Backup
// ---------------------------------------------------------------------------
export type AuditActionType =
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

export interface AuditLogEntry {
  id: string;
  ownerUid: string;
  action: AuditActionType;
  targetCollection: string;
  targetDocumentId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  schemaVersion: number;
}

export interface BackupRun extends BaseEntity {
  backupType: 'AUTOMATED_DAILY' | 'MANUAL_PRE_IMPORT' | 'ON_DEMAND';
  status: 'SUCCESS' | 'FAILED' | 'VERIFIED';
  storageBucketUri: string;
  totalRecordsCount: number;
  verifiedAt?: string;
  verificationNotes?: string;
}
