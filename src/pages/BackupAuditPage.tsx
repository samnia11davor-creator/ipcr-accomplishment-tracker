import React, { useState } from 'react';
import {
  ShieldCheck,
  GitBranch,
  Database,
  Trash2,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const BackupAuditPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'backups' | 'audit' | 'trash'>('backups');

  // Sample verified backup runs
  const backupRuns = [
    {
      id: 'bk-2026-11-16-01',
      type: 'Automated Daily Snapshot',
      timestamp: '2026-11-16 02:00 AM PHT',
      recordsCount: 246,
      checksum: 'sha256:7f4a...9b12',
      status: 'VERIFIED',
      destination: 'gs://ipcr-nia-ro11-backups/firestore/daily/',
    },
    {
      id: 'bk-2026-11-15-01',
      type: 'Automated Daily Snapshot',
      timestamp: '2026-11-15 02:00 AM PHT',
      recordsCount: 238,
      checksum: 'sha256:3e1c...4a88',
      status: 'VERIFIED',
      destination: 'gs://ipcr-nia-ro11-backups/firestore/daily/',
    },
  ];

  // Sample immutable audit log entries
  const auditLogs = [
    {
      id: 'log-001',
      timestamp: '2026-11-16 01:15 PM PHT',
      action: 'ACTIVITY_CREATED',
      entity: 'DailyActivity (act-001)',
      user: 'Civil Engineer (ownerUid)',
      details: 'Logged DED cut-off wall hydraulic computation for Digos RIS.',
    },
    {
      id: 'log-002',
      timestamp: '2026-11-15 04:30 PM PHT',
      action: 'COMMITMENT_CONFIRMED',
      entity: 'IpcrCommitment (C-02)',
      user: 'Civil Engineer (ownerUid)',
      details: 'Confirmed AI-suggested match for Feasibility Study review.',
    },
    {
      id: 'log-003',
      timestamp: '2026-11-15 11:00 AM PHT',
      action: 'DOCUMENT_UPDATED',
      entity: 'DocumentRecord (doc-001)',
      user: 'Civil Engineer (ownerUid)',
      details: 'Updated status to On-going and recorded hydraulic review findings.',
    },
  ];

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
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Verify Integrity
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Database className="w-3.5 h-3.5" />}>
            Create On-Demand Backup
          </Button>
        </div>
      </div>

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
                GitHub Private Repository: ipcr-accomplishment-tracker
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Branches: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">main</code>,{' '}
                <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">development</code>, feature branches.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <Badge variant="emerald" size="sm" dot>Git Rollback Active</Badge>
                <span className="text-slate-400 text-[11px]">Phase 0 Release: v0.1.0 Ready</span>
              </div>
            </div>
            <Lock className="w-6 h-6 text-slate-400" />
          </div>
        </Card>

        {/* Layer 2: Cloud Firestore Snapshots */}
        <Card padding="md" className="border-l-4 border-l-nia-600">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-nia-600" />
                <span className="text-xs font-bold uppercase text-nia-700">Data Layer (Database & Files)</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Google Cloud Firestore & Storage Bucket
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Region: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">asia-southeast1</code> (Singapore / PHT Low Latency).
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <Badge variant="blue" size="sm" dot>Daily Automated Backups</Badge>
                <span className="text-slate-400 text-[11px]">Next: 02:00 AM PHT</span>
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
            Immutable Audit Trail
          </button>
          <button
            onClick={() => setActiveTab('trash')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'trash'
                ? 'border-nia-600 text-nia-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Trash & Soft-Deleted Items (0)
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
                <th className="table-th">Timestamp (Asia/Manila)</th>
                <th className="table-th">Record Count</th>
                <th className="table-th">Checksum Verification</th>
                <th className="table-th">Destination Bucket</th>
                <th className="table-th text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backupRuns.map((run) => (
                <tr key={run.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="table-td">
                    <div className="font-semibold text-xs text-slate-900">{run.type}</div>
                    <div className="font-mono text-[10px] text-slate-400">{run.id}</div>
                  </td>
                  <td className="table-td text-xs text-slate-600">{run.timestamp}</td>
                  <td className="table-td text-xs font-semibold text-slate-800">{run.recordsCount} records</td>
                  <td className="table-td font-mono text-[11px] text-slate-500">{run.checksum}</td>
                  <td className="table-td font-mono text-[11px] text-slate-500 truncate max-w-xs">{run.destination}</td>
                  <td className="table-td text-center">
                    <Badge variant="emerald" size="sm" dot>VERIFIED</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'audit' && (
        <Card padding="none" className="overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-th">Timestamp</th>
                <th className="table-th">Action</th>
                <th className="table-th">Entity</th>
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
                  <td className="table-td text-xs font-medium text-slate-700 whitespace-nowrap">{log.entity}</td>
                  <td className="table-td text-xs text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'trash' && (
        <Card padding="md" className="text-center py-12">
          <Trash2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">Trash Bin is Empty</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Soft-deleted activities, commitments, or document logs remain recoverable here for 90 days.
          </p>
        </Card>
      )}
    </div>
  );
};
