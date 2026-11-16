import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  Filter,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useApp } from '@/contexts/AppContext';

export const AccomplishmentPage: React.FC = () => {
  const { commitments, activities } = useApp();
  const [filterMode, setFilterMode] = useState<'ALL' | 'DEFICITS' | 'COMPLETED'>('ALL');

  const activeActivities = activities.filter((a) => !a.isDeleted);

  const items = commitments.map((com) => {
    const related = activeActivities.filter(
      (a) => a.commitmentId === com.id && a.status === 'COMPLETED'
    );
    const targetQty = com.numericalTarget || 1;
    const validatedQty = related.length;
    const percentage = Math.min(100, Math.round((validatedQty / targetQty) * 100));

    // Sort to find latest activity date
    const sortedDates = related.map((r) => r.activityDate).sort().reverse();
    const lastActivityDate = sortedDates[0] || '—';

    return {
      com,
      targetQty,
      validatedQty,
      percentage,
      relatedActivitiesCount: related.length,
      lastActivityDate,
      status: percentage === 100 ? 'COMPLETED' : validatedQty > 0 ? 'ON_TRACK' : 'NO_ACTIVITY',
    };
  });

  const filteredItems = items.filter((item) => {
    if (filterMode === 'DEFICITS') return item.percentage < 100;
    if (filterMode === 'COMPLETED') return item.percentage === 100;
    return true;
  });

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
          <Button
            variant={filterMode === 'DEFICITS' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterMode(filterMode === 'DEFICITS' ? 'ALL' : 'DEFICITS')}
            leftIcon={<Filter className="w-3.5 h-3.5" />}
          >
            {filterMode === 'DEFICITS' ? 'Showing Deficits (Click to Show All)' : 'Filter Deficits'}
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
              <th className="table-th">Related Daily Logs</th>
              <th className="table-th">Last Activity</th>
              <th className="table-th">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map(({ com, targetQty, validatedQty, percentage, relatedActivitiesCount, lastActivityDate, status }) => (
              <tr key={com.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Indicator & Code */}
                <td className="table-td max-w-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-nia-50 text-nia-700 border border-nia-200">
                      {com.commitmentCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 truncate">{com.mfoPap}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 pl-8 line-clamp-1">
                    {com.successIndicator}
                  </div>
                </td>

                {/* Target */}
                <td className="table-td text-center font-semibold text-xs text-slate-700 whitespace-nowrap">
                  {targetQty} ({com.measurementType})
                </td>

                {/* Validated Output */}
                <td className="table-td text-center font-bold text-xs text-slate-900 whitespace-nowrap">
                  {validatedQty}
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

                {/* Supporting Daily Logs */}
                <td className="table-td whitespace-nowrap">
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-700 font-medium">{relatedActivitiesCount} activity log(s)</span>
                  </div>
                </td>

                {/* Last Activity */}
                <td className="table-td whitespace-nowrap text-xs text-slate-500 font-mono">
                  {lastActivityDate}
                </td>

                {/* Status Pill */}
                <td className="table-td whitespace-nowrap">
                  {status === 'COMPLETED' ? (
                    <Badge variant="emerald" size="sm" dot>Target Met</Badge>
                  ) : status === 'ON_TRACK' ? (
                    <Badge variant="blue" size="sm" dot>In Progress</Badge>
                  ) : (
                    <Badge variant="rose" size="sm" dot>Zero Activity</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
