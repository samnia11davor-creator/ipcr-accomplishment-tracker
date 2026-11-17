import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  IpcrCommitment,
  DailyActivity,
  DocumentRecord,
  AuditLogEntry,
} from '@/types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_COMMITMENTS,
  INITIAL_DOCUMENTS,
  INITIAL_ACTIVITIES,
  INITIAL_AUDIT_LOGS,
} from '@/data/initialData';
import { classifyActivityText } from '@/services/aiClassifier';
import { formatManilaDateTime } from '@/lib/dates';

interface AppContextType {
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  commitments: IpcrCommitment[];
  activities: DailyActivity[];
  documents: DocumentRecord[];
  auditLogs: AuditLogEntry[];
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;

  // Commitments Management
  addCommitment: (commitmentData: Partial<IpcrCommitment>) => IpcrCommitment;
  updateCommitment: (commitment: IpcrCommitment) => void;
  deleteCommitment: (id: string) => void;
  saveCycleCommitments: (newCommitments: IpcrCommitment[]) => void;

  // Activities CRUD
  addActivity: (activityData: Partial<DailyActivity>) => DailyActivity;
  updateActivity: (activity: DailyActivity) => void;
  deleteActivity: (id: string) => void;
  restoreActivity: (id: string) => void;
  confirmClassification: (activityId: string, commitmentId: string) => void;
  rejectClassification: (activityId: string) => void;

  // Documents CRUD
  addDocument: (docData: Partial<DocumentRecord>) => DocumentRecord;
  updateDocument: (doc: DocumentRecord) => void;
  deleteDocument: (id: string) => void;
  restoreDocument: (id: string) => void;

  // Backup & Restore
  downloadBackupSnapshot: () => void;
  restoreBackupSnapshot: (jsonString: string) => boolean;
  importHistoricalData: (records: {
    activities?: DailyActivity[];
    documents?: DocumentRecord[];
    commitments?: IpcrCommitment[];
  }) => { importedActivities: number; importedDocuments: number };
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'ipcr_accomplishment_tracker_store_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  const [commitments, setCommitments] = useState<IpcrCommitment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_commitments`);
    return saved ? JSON.parse(saved) : INITIAL_COMMITMENTS;
  });

  const [activities, setActivities] = useState<DailyActivity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [documents, setDocuments] = useState<DocumentRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_documents`);
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [selectedPeriod, setSelectedPeriod] = useState<string>('SEM2');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_commitments`, JSON.stringify(commitments));
  }, [commitments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_documents`, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Helper to log audit entries
  const addAuditLog = (action: AuditLogEntry['action'], entity: string, details: Record<string, unknown>) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      ownerUid: userProfile.ownerUid,
      action,
      targetCollection: entity,
      targetDocumentId: String(details.id || 'N/A'),
      details,
      timestamp: formatManilaDateTime(new Date()),
      schemaVersion: 1,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // User Profile
  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated, updatedAt: new Date().toISOString() }));
    addAuditLog('USER_LOGIN', 'users', { updatedFields: Object.keys(updated) });
  };

  // Commitments Management
  const addCommitment = (data: Partial<IpcrCommitment>): IpcrCommitment => {
    const id = data.id || `com-${Date.now()}`;
    const now = new Date().toISOString();
    const newCommitment: IpcrCommitment = {
      id,
      ownerUid: userProfile.ownerUid,
      cycleId: data.cycleId || `cycle-2026-${selectedPeriod.toLowerCase()}`,
      tier: data.tier || 'STRATEGIC',
      themeCategory: data.themeCategory || 'SUSTAINABLE IRRIGATION DEVELOPMENT AND SYSTEM MANAGEMENT',
      strategicObjective: data.strategicObjective || '',
      mfoPap: data.mfoPap || '',
      commitmentCode: data.commitmentCode || `CUSTOM-${Date.now().toString().slice(-4)}`,
      successIndicator: data.successIndicator || '',
      target: data.target || data.successIndicator || '',
      numericalTarget: data.numericalTarget ?? 1,
      measurementType: data.measurementType || 'Count',
      allottedBudget: data.allottedBudget ?? null,
      accountableDivision: data.accountableDivision || `${userProfile.section} / ${userProfile.positionTitle}`,
      actualAccomplishmentDraft: data.actualAccomplishmentDraft || '',
      sourceWorkbook: data.sourceWorkbook || 'IPCR Semester Setup',
      sourceCellRef: data.sourceCellRef || 'N/A',
      rating: data.rating || { q: 5, e: 5, t: 5, average: 5.0 },
      isActive: true,
      sortOrder: data.sortOrder ?? (commitments.length + 1),
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
      isDeleted: false,
    };

    setCommitments((prev) => [...prev, newCommitment]);
    addAuditLog('REPORT_GENERATED', 'commitments', { id, code: newCommitment.commitmentCode });
    return newCommitment;
  };

  const updateCommitment = (commitment: IpcrCommitment) => {
    const updated = { ...commitment, updatedAt: new Date().toISOString() };
    setCommitments((prev) => prev.map((c) => (c.id === commitment.id ? updated : c)));
    addAuditLog('REPORT_GENERATED', 'commitments', { id: commitment.id, action: 'COMMITMENT_UPDATED' });
  };

  const deleteCommitment = (id: string) => {
    setCommitments((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('REPORT_GENERATED', 'commitments', { id, action: 'COMMITMENT_REMOVED' });
  };

  const saveCycleCommitments = (newCommitments: IpcrCommitment[]) => {
    setCommitments(newCommitments);
    addAuditLog('REPORT_GENERATED', 'commitments', {
      action: 'CYCLE_COMMITMENTS_SET',
      period: selectedPeriod,
      count: newCommitments.length,
    });
  };

  // Activities CRUD
  const addActivity = (data: Partial<DailyActivity>): DailyActivity => {
    const id = `act-${Date.now()}`;
    const now = new Date().toISOString();

    // Run AI Classifier
    const aiSuggestion = classifyActivityText(
      data.description || '',
      data.output || '',
      data.category || '',
      commitments
    );

    const newActivity: DailyActivity = {
      id,
      ownerUid: userProfile.ownerUid,
      cycleId: `cycle-2026-${selectedPeriod.toLowerCase()}`,
      activityDate: data.activityDate || new Date().toISOString().split('T')[0],
      description: data.description || '',
      output: data.output || '',
      category: data.category || 'Detailed Engineering',
      project: data.project || '',
      imoLocation: data.imoLocation,
      calendarYear: data.calendarYear,
      timeSpentHours: data.timeSpentHours || 4.0,
      status: data.status || 'COMPLETED',
      commitmentId: data.commitmentId || aiSuggestion.suggestedCommitmentId,
      classificationStatus: data.commitmentId ? 'CONFIRMED' : 'PENDING',
      aiClassification: aiSuggestion,
      remarks: data.remarks || '',
      isHistorical: false,
      supportingDocumentCount: data.supportingDocumentCount || (data.attachments ? data.attachments.length : 0),
      attachments: data.attachments || [],
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
      isDeleted: false,
    };

    setActivities((prev) => [newActivity, ...prev]);
    addAuditLog('ACTIVITY_CREATED', 'activities', {
      id,
      description: newActivity.description,
      suggestedCommitment: aiSuggestion.suggestedCommitmentId,
    });

    return newActivity;
  };

  const updateActivity = (activity: DailyActivity) => {
    const updated = { ...activity, updatedAt: new Date().toISOString() };
    setActivities((prev) => prev.map((a) => (a.id === activity.id ? updated : a)));
    addAuditLog('ACTIVITY_UPDATED', 'activities', { id: activity.id, status: activity.status });
  };

  const deleteActivity = (id: string) => {
    const now = new Date().toISOString();
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isDeleted: true, deletedAt: now } : a))
    );
    addAuditLog('ACTIVITY_DELETED', 'activities', { id, isSoftDeleted: true });
  };

  const restoreActivity = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isDeleted: false, deletedAt: null } : a))
    );
    addAuditLog('ACTIVITY_UPDATED', 'activities', { id, action: 'RESTORE_RECORD' });
  };

  const confirmClassification = (activityId: string, commitmentId: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId
          ? {
              ...a,
              commitmentId,
              classificationStatus: 'CONFIRMED',
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );
    addAuditLog('COMMITMENT_CONFIRMED', 'activities', { activityId, commitmentId });
  };

  const rejectClassification = (activityId: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId
          ? {
              ...a,
              classificationStatus: 'REJECTED',
              commitmentId: undefined,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );
    addAuditLog('CLASSIFICATION_REJECTED', 'activities', { activityId });
  };

  // Documents CRUD
  const addDocument = (data: Partial<DocumentRecord>): DocumentRecord => {
    const id = `doc-${Date.now()}`;
    const now = new Date().toISOString();

    const newDoc: DocumentRecord = {
      id,
      ownerUid: userProfile.ownerUid,
      type: data.type || 'Incoming',
      documentType: data.documentType || 'Official Letter',
      meansOfTransmission: data.meansOfTransmission || 'DMS / Hand Carried',
      description: data.description || '',
      fileDetail: data.fileDetail || `DOC-2026-${Date.now().toString().slice(-4)}`,
      dateReceivedByUser: data.dateReceivedByUser || new Date().toISOString().split('T')[0],
      senderSource: data.senderSource || 'Engineering Section',
      project: data.project || '',
      typeOfStudy: data.typeOfStudy || 'Detailed Engineering',
      calendarYear: 2026,
      dateReceived: data.dateReceived || new Date().toISOString().split('T')[0],
      actionTaken: data.actionTaken || 'Document recorded for section review.',
      dateProcessed: data.dateProcessed,
      status: data.status || 'Pending',
      remarks: data.remarks,
      followUpAction: data.followUpAction,
      documentLink: data.documentLink,
      attachments: data.attachments || [],
      isHistorical: false,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
      isDeleted: false,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    addAuditLog('DOCUMENT_CREATED', 'documents', { id, fileDetail: newDoc.fileDetail });
    return newDoc;
  };

  const updateDocument = (doc: DocumentRecord) => {
    const updated = { ...doc, updatedAt: new Date().toISOString() };
    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? updated : d)));
    addAuditLog('DOCUMENT_UPDATED', 'documents', { id: doc.id, status: doc.status });
  };

  const deleteDocument = (id: string) => {
    const now = new Date().toISOString();
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isDeleted: true, deletedAt: now } : d))
    );
    addAuditLog('DOCUMENT_UPDATED', 'documents', { id, isSoftDeleted: true });
  };

  const restoreDocument = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isDeleted: false, deletedAt: null } : d))
    );
    addAuditLog('DOCUMENT_UPDATED', 'documents', { id, action: 'RESTORE_RECORD' });
  };

  // Backups
  const downloadBackupSnapshot = () => {
    const snapshot = {
      exportTimestamp: new Date().toISOString(),
      manilaTime: formatManilaDateTime(new Date()),
      userProfile,
      commitments,
      activities,
      documents,
      auditLogs,
      checksum: `sha256:${Math.random().toString(36).substring(2, 10)}${Date.now()}`,
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IPCR_Snapshot_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addAuditLog('BACKUP_CREATED', 'backupRuns', { totalRecords: activities.length + documents.length });
  };

  const restoreBackupSnapshot = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.activities && Array.isArray(data.activities)) {
        setActivities(data.activities);
      }
      if (data.documents && Array.isArray(data.documents)) {
        setDocuments(data.documents);
      }
      if (data.commitments && Array.isArray(data.commitments)) {
        setCommitments(data.commitments);
      }
      if (data.userProfile) {
        setUserProfile(data.userProfile);
      }
      addAuditLog('RESTORE_EXECUTED', 'backupRuns', { restoredTimestamp: data.exportTimestamp });
      return true;
    } catch (e) {
      console.error('Failed to parse backup snapshot', e);
      return false;
    }
  };

  const importHistoricalData = (records: {
    activities?: DailyActivity[];
    documents?: DocumentRecord[];
    commitments?: IpcrCommitment[];
  }) => {
    let actCount = 0;
    let docCount = 0;

    if (records.activities && records.activities.length > 0) {
      setActivities((prev) => [...records.activities!, ...prev]);
      actCount = records.activities.length;
    }

    if (records.documents && records.documents.length > 0) {
      setDocuments((prev) => [...records.documents!, ...prev]);
      docCount = records.documents.length;
    }

    if (records.commitments && records.commitments.length > 0) {
      setCommitments(records.commitments);
    }

    addAuditLog('REPORT_GENERATED', 'importRuns', {
      importedActivities: actCount,
      importedDocuments: docCount,
    });

    return { importedActivities: actCount, importedDocuments: docCount };
  };

  const resetToDefaults = () => {
    setUserProfile(INITIAL_USER_PROFILE);
    setCommitments(INITIAL_COMMITMENTS);
    setActivities(INITIAL_ACTIVITIES);
    setDocuments(INITIAL_DOCUMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        commitments,
        activities,
        documents,
        auditLogs,
        selectedPeriod,
        setSelectedPeriod,
        addCommitment,
        updateCommitment,
        deleteCommitment,
        saveCycleCommitments,
        addActivity,
        updateActivity,
        deleteActivity,
        restoreActivity,
        confirmClassification,
        rejectClassification,
        addDocument,
        updateDocument,
        deleteDocument,
        restoreDocument,
        downloadBackupSnapshot,
        restoreBackupSnapshot,
        importHistoricalData,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

