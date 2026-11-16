import React, { useState } from 'react';
import {
  Search,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { formatCurrency } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';

export const CommitmentsPage: React.FC = () => {
  const { commitments, activities, selectedPeriod } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const activeActivities = activities.filter((a) => !a.isDeleted);

  const filteredCommitments = commitments.filter((com) => {
    return (
      com.commitmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      com.mfoPap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      com.successIndicator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      com.target.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            IPCR Commitment Library
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Central repository of approved IPCR commitments, success indicators, and baseline targets • Preserves original workbook text
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="blue" size="md">
            Merged G:H Integrity Guaranteed
          </Badge>
        </div>
      </div>

      {/* Cycle Selector & Information Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm" className="p-4 flex items-center justify-between border-l-4 border-l-nia-600">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Selected Cycle</span>
            <div className="font-bold text-sm text-slate-800 mt-0.5">{selectedPeriod} 2026</div>
            <span className="text-[10px] text-slate-400">Civil Service Commission Approved</span>
          </div>
          <Badge variant="blue">Active</Badge>
        </Card>

        <Card padding="sm" className="p-4 flex items-center justify-between border-l-4 border-l-emerald-600">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Source Reference</span>
            <div className="font-medium text-xs text-slate-800 mt-0.5 truncate max-w-[190px]">
              SLT-IPCR-2ND-SEM-2026...
            </div>
            <span className="text-[10px] text-slate-400">Sheet: IPCR 2026 (Merged G:H)</span>
          </div>
          <Badge variant="emerald">Source Linked</Badge>
        </Card>

        <Card padding="sm" className="p-4 flex items-center justify-between border-l-4 border-l-purple-600">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Commitments</span>
            <div className="font-bold text-sm text-slate-800 mt-0.5">{commitments.length} Indicators</div>
            <span className="text-[10px] text-slate-400">Core Engineering & Support MFOs</span>
          </div>
          <Badge variant="purple">100% Tracked</Badge>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search commitments by MFO/PAP, indicator text, code, or measurement type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-nia-500 focus:ring-nia-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Commitment Cards */}
      <div className="space-y-4">
        {filteredCommitments.map((com) => {
          const completedActs = activeActivities.filter(
            (a) => a.commitmentId === com.id && a.status === 'COMPLETED'
          );
          const currentCount = completedActs.length;
          const targetCount = com.numericalTarget || 1;

          return (
            <Card key={com.id} padding="md" className="border hover:border-slate-300 transition-all">
              {/* Top row: Code, MFO/PAP, Budget, Status */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-md bg-nia-700 text-white font-mono text-xs font-bold">
                    {com.commitmentCode}
                  </span>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      {com.mfoPap}
                    </span>
                    <div className="text-xs text-slate-500 font-medium">
                      Accountable: {com.accountableDivision}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="cyan" size="sm">
                    Budget: {formatCurrency(com.allottedBudget)}
                  </Badge>
                  <Badge variant="slate" size="sm" className="font-mono text-[10px]">
                    Cell: {com.sourceCellRef}
                  </Badge>
                </div>
              </div>

              {/* Core Indicator & Target */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Success Indicator (Approved Language)
                  </span>
                  <p className="text-xs text-slate-900 font-medium mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {com.successIndicator}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Approved Target & Measure
                  </span>
                  <p className="text-xs text-slate-900 font-medium mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {com.target}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                    <span>Measurement Type:</span>
                    <Badge variant="blue" size="sm">{com.measurementType}</Badge>
                  </div>
                </div>
              </div>

              {/* Actual Accomplishment Draft (Merged G:H preview) */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">
                    Actual Accomplishment Field (Merged G:H cells in Excel):
                  </span>
                  <span className="font-mono text-slate-700 text-[11px] font-bold">
                    Progress: {currentCount} / {targetCount} ({Math.min(100, Math.round((currentCount / targetCount) * 100))}%)
                  </span>
                </div>
                <p className="text-xs text-slate-800 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60">
                  "{com.actualAccomplishmentDraft}"
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
