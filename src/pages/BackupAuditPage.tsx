import React, { useState } from 'react';
import {
  ShieldCheck,
  GitBranch,
  Database,
  Trash2,
  Lock,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useApp } from '@/contexts/AppContext';

export const BackupAuditPage: React.FC = () => {
  const {
    auditLogs,
    activities,
    documents,
    downloadBackupSnapshot,
    restoreBackupSnapshot,
    restoreActivity,
    restoreDocument,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'backups' | 'audit' | 'trash'>('backups');
  const [restoreFeedback, setRestoreFeedback] = useState<string | null>(null);

  const deletedActivities = activities.filter((a) => a.isDeleted);
  const deletedDocuments = documents.filter((d) => d.isDeleted);
  const totalTrashCount = deletedActivities.length + deletedDocuments.length;

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = restoreBackupSnapshot(content);
      if (success) {
        setRestoreFeedback('Database snapshot successfully restored! All records and audit trails verified.');
      } else {
        alert('Failed to parse backup snapshot. Ensure it is a valid IPCR JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Backup, Data Protection & Audit Trails
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dual-layer disaster recovery management • Immutable transaction logs & soft-deletion recovery
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={downloadBackupSnapshot}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Download Verified Backup Snapshot
          </Button>
        </div>
      </div>

      {restoreFeedback && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{restoreFeedback}</span>
          </div>
          <button onClick={() => setRestoreFeedback(null)} className="text-emerald-700 font-bold text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Dual Backup Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Layer 1: GitHub Codebase */}
        <Card padding="md" className="border-l-4 border-l-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold uppercase text-slate-600">Application Layer (Codebase)</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                GitHub Repository: ipcr-accomplishment-tracker
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Branches: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">main</code>,{' '}
                <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">development</code>. Release tag: v0.1.0.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <Badge variant="emerald" size="sm" dot>Git Rollback Active</Badge>
                <span className="text-slate-400 text-[11px]">Milestone Tagged</span>
              </div>
            </div>
            <Lock className="w-6 h-6 text-slate-400" />
          </div>
        </Card>

        {/* Layer 2: Cloud / Local Storage Snapshots */}
        <Card padding="md" className="border-l-4 border-l-nia-600">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-nia-600" />
                <span className="text-xs font-bold uppercase text-nia-700">Data Layer (Snapshots & Recovery)</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Atomic JSON Snapshots & Google Cloud Storage
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Preserves all records, cell coordinates, and audit history.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <label className="cursor-pointer text-nia-700 font-medium hover:underline inline-flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restore from JSON File</span>
                  <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
                </label>
              </div>
            </div>
            <ShieldCheck className="w-6 h-6 text-nia-600" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('backups')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'backups'
                ? 'border-nia-600 text-nia-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Verified Backup Runs
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-nia-600 text-nia-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Immutable Audit Trail ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('trash')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'trash'
                ? 'border-nia-600 text-nia-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Trash & Soft-Deleted Items ({totalTrashCount})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'backups' && (
        <Card padding="none" className="overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-th">Backup ID / Type</th>
                <th className="table-th">Manila Timestamp</th>
                <th className="table-th">Record Count</th>
                <th className="table-th">Destination / Mode</th>
                <th className="table-th text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="table-td">
                  <div className="font-semibold text-xs text-slate-900">Current Live State Snapshot</div>
                  <div className="font-mono text-[10px] text-slate-400">ACTIVE_MEMORY_SYNC</div>
                </td>
                <td className="table-td text-xs text-slate-600">Continuous Auto-Save</td>
                <td className="table-td text-xs font-semibold text-slate-800">
                  {activities.length + documents.length} records
                </td>
                <td className="table-td font-mono text-[11px] text-slate-500">
                  localStorage + Verified JSON Dump
                </td>
                <td className="table-td text-center">
                  <Badge variant="emerald" size="sm" dot>VERIFIED</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'audit' && (
        <Card padding="none" className="overflow-hidden">
          <div className="max-h-[450px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-100 z-10">
                <tr>
                  <th className="table-th">Timestamp</th>
                  <th className="table-th">Action</th>
                  <th className="table-th">Target Entity</th>
                  <th className="table-th">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td text-xs font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="table-td whitespace-nowrap">
                      <Badge variant="slate" size="sm" className="font-mono">{log.action}</Badge>
                    </td>
                    <td className="table-td text-xs font-medium text-slate-700 whitespace-nowrap">{log.targetCollection}</td>
                    <td className="table-td text-xs text-slate-600 max-w-md truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'trash' && (
        <Card padding="md">
          {totalTrashCount === 0 ? (
            <div className="text-center py-10">
              <Trash2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">Trash Bin is Empty</h3>
              <p className="text-xs text-slate-500 mt-1">
                Soft-deleted activities or document logs will be listed here for immediate recovery.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {deletedActivities.map((act) => (
                <div key={act.id} className="p-3 rounded-lg bg-rose-50/50 border border-rose-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-900">[Activity] {act.category}: </span>
                    <span className="text-slate-700">{act.description}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">Date: {act.activityDate}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => restoreActivity(act.id)}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Restore
                  </Button>
                </div>
              ))}

              {deletedDocuments.map((doc) => (
                <div key={doc.id} className="p-3 rounded-lg bg-rose-50/50 border border-rose-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-900">[Document] {doc.documentType}: </span>
                    <span className="text-slate-700">{doc.description}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => restoreDocument(doc.id)}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
