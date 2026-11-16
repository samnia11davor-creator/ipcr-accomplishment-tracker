import React from 'react';
import {
  Award,
  FileText,
  Paperclip,
  ShieldAlert,
  Filter,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const AccomplishmentPage: React.FC = () => {
  // Sample monitoring items demonstrating validated accomplishments vs targets
  const monitoredCommitments = [
    {
      id: 'mon-001',
      code: 'C-01',
      indicator: 'Detailed Engineering Design (DED) of Irrigation Projects',
      targetText: '10 DED Packages completed',
      targetQty: 10,
      validatedQty: 8,
      unit: 'Packages',
      relatedActivitiesCount: 32,
      supportingDocsCount: 14,
      lastActivityDate: '2026-11-16',
      status: 'ON_TRACK',
      evidenceStatus: 'VERIFIED',
    },
    {
      id: 'mon-002',
      code: 'C-02',
      indicator: 'Technical Review of Feasibility Studies (FS)',
      targetText: '6 Feasibility Studies reviewed',
      targetQty: 6,
      validatedQty: 6,
      unit: 'Reports',
      relatedActivitiesCount: 18,
      supportingDocsCount: 6,
      lastActivityDate: '2026-11-15',
      status: 'COMPLETED',
      evidenceStatus: 'VERIFIED',
    },
    {
      id: 'mon-003',
      code: 'C-03',
      indicator: 'Field Inspection and Site Validation',
      targetText: '20 Inspections conducted',
      targetQty: 20,
      validatedQty: 14,
      unit: 'Inspections',
      relatedActivitiesCount: 22,
      supportingDocsCount: 14,
      lastActivityDate: '2026-11-14',
      status: 'ON_TRACK',
      evidenceStatus: 'VERIFIED',
    },
    {
      id: 'mon-004',
      code: 'C-05',
      indicator: 'Annual Irrigation Program of Works (POW)',
      targetText: '4 Program Documents',
      targetQty: 4,
      validatedQty: 0,
      unit: 'Programs',
      relatedActivitiesCount: 0,
      supportingDocsCount: 0,
      lastActivityDate: '—',
      status: 'NO_ACTIVITY',
      evidenceStatus: 'NO_EVIDENCE',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Accomplishment Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time correlation of validated daily activities and evidence against approved IPCR indicators
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" leftIcon={<Filter className="w-3.5 h-3.5" />}>
            Filter Deficits
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Award className="w-4 h-4" />}>
            Reconcile Totals
          </Button>
        </div>
      </div>

      {/* Double-Counting Prevention Notice */}
      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <strong>Anti-Inflation & Deduplication Guard:</strong> Multiple daily activity entries or follow-up communications on the same project deliverable are consolidated into a single physical accomplishment count. Accomplishment figures are strictly tied to unique deliverables with supporting documentation.
        </div>
      </div>

      {/* Monitoring Grid / Table */}
      <Card padding="none" className="overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="table-th">Commitment & Indicator</th>
              <th className="table-th text-center">Target</th>
              <th className="table-th text-center">Validated Output</th>
              <th className="table-th text-center">Progress</th>
              <th className="table-th">Evidence & Activity Records</th>
              <th className="table-th">Last Activity</th>
              <th className="table-th">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {monitoredCommitments.map((item) => {
              const percentage = Math.min(100, Math.round((item.validatedQty / item.targetQty) * 100));
              return (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Indicator & Code */}
                  <td className="table-td max-w-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-nia-50 text-nia-700 border border-nia-200">
                        {item.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-900">{item.indicator}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 pl-8">
                      Target Spec: {item.targetText}
                    </div>
                  </td>

                  {/* Target */}
                  <td className="table-td text-center font-semibold text-xs text-slate-700 whitespace-nowrap">
                    {item.targetQty} {item.unit}
                  </td>

                  {/* Validated Output */}
                  <td className="table-td text-center font-bold text-xs text-slate-900 whitespace-nowrap">
                    {item.validatedQty} {item.unit}
                  </td>

                  {/* Progress Bar */}
                  <td className="table-td text-center whitespace-nowrap min-w-[120px]">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          percentage === 100
                            ? 'bg-emerald-600'
                            : percentage === 0
                            ? 'bg-rose-500'
                            : 'bg-nia-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </td>

                  {/* Supporting Evidence */}
                  <td className="table-td whitespace-nowrap">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-slate-600">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        {item.relatedActivitiesCount} logs
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                        {item.supportingDocsCount} docs
                      </span>
                    </div>
                  </td>

                  {/* Last Activity */}
                  <td className="table-td whitespace-nowrap text-xs text-slate-500">
                    {item.lastActivityDate}
                  </td>

                  {/* Status Pill */}
                  <td className="table-td whitespace-nowrap">
                    {item.status === 'COMPLETED' ? (
                      <Badge variant="emerald" size="sm" dot>Completed</Badge>
                    ) : item.status === 'ON_TRACK' ? (
                      <Badge variant="blue" size="sm" dot>On Track</Badge>
                    ) : (
                      <Badge variant="rose" size="sm" dot>Zero Activity</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
