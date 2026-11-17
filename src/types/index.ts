// ============================================================================
// IPCR Accomplishment Tracker - Domain Type Definitions
// National Irrigation Administration (NIA) - Regional Office XI
// Form: NIAROXI-AFD-Admin-INT-Form13Rev00 (SPMS IPCR)
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
  fullName: string;                // e.g. "ENGR. SAM LESTER R. TAGUIBAO"
  positionTitle: string;           // "Civil Engineer"
  agency: string;                  // "NATIONAL IRRIGATION ADMINISTRATION"
  regionalOffice: string;          // "REGIONAL OFFICE XI"
  division: string;                // "ENGINEERING AND OPERATIONS DIVISION"
  section: string;                 // "Planning and Design Section"
  headOfDivision: string;          // "ENGR. AL TED D. ABBOT"
  headOfOffice: string;            // "ENGR. DEXTER A. SABLAON"
  immediateSupervisor?: string;
  supervisorPosition?: string;
  formCode: string;                // "NIAROXI-AFD-Admin-INT-Form13Rev00"
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
  title: string;                   // "July to Dec, 2026"
  startDate: string;               // "2026-07-01"
  endDate: string;                 // "2026-12-31"
  status: CycleStatus;
  totalCommitments: number;
  sourceWorkbookName?: string;
}

// ---------------------------------------------------------------------------
// 3. IPCR Commitment (Structured by SPMS Tiers)
// ---------------------------------------------------------------------------
export type SpmsTier = 'STRATEGIC' | 'CORE' | 'SUPPORT';

export type MeasurementType =
  | 'Count'
  | 'Quantity'
  | 'Kilometers'
  | 'Hectares'
  | 'Percentage'
  | 'Milestone'
  | 'Qualitative output';

export interface SpmsRating {
  q: number; // Q1 - Quantity
  e: number; // E2 - Efficiency
  t: number; // T3 - Timeliness
  average: number; // A4 - Average
}

export interface IpcrCommitment extends BaseEntity {
  cycleId: string;
  tier: SpmsTier;                  // Strategic, Core, or Support
  themeCategory?: string;          // e.g. "SUSTAINABLE IRRIGATION DEVELOPMENT AND SYSTEM MANAGEMENT"
  strategicObjective?: string;     // e.g. "STRATEGIC OBJECTIVE 3. IMPROVE PLANNING, DESIGN..."
  mfoPap: string;                  // e.g. "SM7. FEASIBILITY STUDIES AND DETAILED ENGINEERING"
  commitmentCode: string;          // e.g. "SM7-A", "SM7-POW", "CF2M8", "CF2M9", "SF4-A1", "SF4-A2", "SF4-B"
  successIndicator: string;        // Official success indicator / (TARGETS + MEASURES)
  target: string;                  // Target summary
  numericalTarget: number | null;
  measurementType: MeasurementType;
  allottedBudget: number | null;
  accountableDivision: string;
  actualAccomplishmentDraft: string; // Accumulated / formatted narrative text
  sourceWorkbook: string;
  sourceCellRef: string;
  rating?: SpmsRating;
  remarks?: string;
  isActive: boolean;
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// 4. Daily Activities (Feed/Supply to IPCR commitments)
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
  | 'REPORT'
  | 'PRE-FSR'
  | 'FSR'
  | 'POW PRE-FSR'
  | 'POW FS'
  | 'POW DE'
  | 'POW LARP'
  | 'POW SEIA'
  | 'MEMORANDUM'
  | 'PIR'
  | 'TOR'
  | 'BILLING'
  | 'ASA'
  | 'MISC'
  | 'Other'
  | (string & {});

export type ActivityStatus = 'DRAFT' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type ClassificationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'MANUAL';

export interface AiClassificationSuggestion {
  suggestedCommitmentId: string;
  confidenceScore: number;
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

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileSize: number;                // in bytes
  fileType: string;                // e.g. "image/png", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  uploadedAt: string;              // ISO timestamp
  thumbnailUrl?: string;           // Small preview dataUrl (for images)
  storageKey?: string;             // IndexedDB lookup key
}

export interface DailyActivity extends BaseEntity {
  cycleId: string;
  activityDate: string;            // YYYY-MM-DD (Asia/Manila)
  description: string;
  output: string;
  category: ActivityCategory;
  projectId?: string;
  projectName?: string;
  project?: string;                // Specific Irrigation System name (e.g. "Pagan SRIP", "Lupon IS")
  imoLocation?: string;            // "Davao Oriental IMO", "Davao del Norte IMO", "Davao del Sur IMO", "Regional Office XI"
  calendarYear?: number;           // e.g. 2026, 2027
  docType?: string;                // Letter, Memorandum, POW, FSR, Special Order
  timeSpentHours?: number;
  status: ActivityStatus;
  commitmentId?: string;           // The target commitment supplied by this activity
  classificationStatus: ClassificationStatus;
  aiClassification?: AiClassificationSuggestion;
  remarks?: string;
  isHistorical: boolean;
  sourceSheet?: string;
  supportingDocumentCount?: number;
  attachments?: TaskAttachment[];  // Photos, PDFs, Word, Excel files

  // Field Work specific properties (SM7 Submit Program of Works)
  isFieldWork?: boolean;           // True if conducted on-site / in the field (SM7 POW)
  fieldWorkCount?: number;         // Count of field works/site visits (default 1)
  fieldWorkType?: string;          // e.g. "Site Inspection", "Field Validation for POW", "Survey Check"
  siteLocation?: string;           // Specific barangay / river / dam site / stationing
  jointWith?: string;              // e.g. "Provincial Agri, IMO Engineers, IA officers"
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
  documentType: string;            // Letter, POW, Special Order, Memorandum, FSR
  meansOfTransmission: string;     // Courier, Email, Hand Carried, DMS
  description: string;
  fileDetail: string;              // Ref code / filename
  dateReceivedByUser: string;      // YYYY-MM-DD
  senderSource: string;
  projectId?: string;
  projectName?: string;
  project?: string;
  typeOfStudy?: string;
  calendarYear: number;
  dateReceived: string;
  actionTaken: string;
  dateProcessed?: string;
  status: DocumentStatus;
  dateFinished?: string;
  remarks?: string;
  followUpAction?: string;
  documentLink?: string;
  isHistorical: boolean;
  sourceSheet?: string;
  attachments?: TaskAttachment[];
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
// 7. Audit & Backup
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
