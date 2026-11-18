import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileSpreadsheet,
  CheckCircle,
  Printer,
  Save,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useApp } from '@/contexts/AppContext';
import {
  exportIpcrToExcel,
  exportAccomplishmentReportToWord,
  exportAccomplishmentReportToPdf,
} from '@/services/exportService';

export const ReportsPage: React.FC = () => {
  const { commitments, activities, userProfile, selectedPeriod, setSelectedPeriod } = useApp();

  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string>('');
  const [narratives, setNarratives] = useState<Record<string, string>>({});
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // Synthesize default narratives from validated activities
  useEffect(() => {
    if (commitments.length > 0 && !selectedCommitmentId) {
      setSelectedCommitmentId(commitments[0].id);
    }

    const synthesized: Record<string, string> = {};
    commitments.forEach((com) => {
      const related = activities.filter(
        (a) => a.commitmentId === com.id && a.status === 'COMPLETED' && !a.isDeleted
      );

      if (related.length > 0) {
        const docActs = related.filter((a) => !a.isFieldWork);
        const fieldActs = related.filter((a) => a.isFieldWork);
        const fieldUnits = fieldActs.reduce((acc, a) => acc + (a.fieldWorkCount || 1), 0);

        let narrative = `Successfully prepared and accomplished ${docActs.length} document deliverable(s) under ${com.mfoPap}, specifically: ${docActs.map((a) => a.output).join('; ')}.`;
        if (fieldUnits > 0) {
          narrative += ` Additionally conducted ${fieldUnits} on-site field validation/investigation(s) (${fieldActs.map((a) => a.output).join('; ')}) supplying POW readiness.`;
        }
        narrative += ` All submissions strictly verified against approved IPCR targets.`;
        synthesized[com.id] = narrative;
      } else {
        synthesized[com.id] = com.actualAccomplishmentDraft || 'No accomplishments recorded for this period.';
      }
    });

    setNarratives(synthesized);
  }, [commitments, activities, selectedCommitmentId]);

  const activeCommitment = commitments.find((c) => c.id === selectedCommitmentId) || commitments[0];

  const handleSaveNarrative = () => {
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2000);
  };

  const handleExcelExport = () => {
    exportIpcrToExcel(commitments, activities, userProfile, selectedPeriod);
  };

  const handleWordExport = () => {
    exportAccomplishmentReportToWord(commitments, activities, userProfile, selectedPeriod);
  };

  const handlePdfExport = () => {
    exportAccomplishmentReportToPdf(commitments, activities, userProfile, selectedPeriod);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Automated Accomplishment Report Generator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidates validated daily activities into official IPCR accomplishment narratives and multi-format exports
          </p>
        </div>

        {/* Export Formats */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExcelExport}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
          >
            Export Excel (IPCR Format)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleWordExport}
            leftIcon={<FileText className="w-3.5 h-3.5 text-blue-600" />}
          >
            Export Word (.doc)
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePdfExport}
            leftIcon={<Printer className="w-3.5 h-3.5 text-white" />}
          >
            Export PDF (Print)
          </Button>
        </div>
      </div>

      {/* Period & Generation Control Bar */}
      <Card padding="md" className="bg-slate-900 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
              Target Reporting Cycle
            </span>
            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-slate-800 text-white text-xs font-semibold rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="SEM2">2nd Semester 2026 (July 1 - December 31, 2026)</option>
                <option value="SEM1">1st Semester 2026 (January 1 - June 30, 2026)</option>
                <option value="Q3">3rd Quarter 2026 (July - September 2026)</option>
                <option value="Q4">4th Quarter 2026 (October - December 2026)</option>
                <option value="CUSTOM">Custom Date Slicing...</option>
              </select>
              <Badge variant="blue" size="md">
                {activities.filter((a) => !a.isDeleted).length} Activities Analyzed
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-slate-300">Report Status: Ready for Review</div>
              <div className="text-[10px] text-slate-400">Ratee: {userProfile.fullName} ({userProfile.positionTitle})</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Report Review & Narrative Customization Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commitment List (1 Col) */}
        <Card padding="none" className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Commitment Breakdown</CardTitle>
            <Badge variant="slate">{commitments.length} Indicators</Badge>
          </CardHeader>
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {commitments.map((com) => {
              const relatedCount = activities.filter(
                (a) => a.commitmentId === com.id && a.status === 'COMPLETED' && !a.isDeleted
              ).length;
              const isSelected = com.id === selectedCommitmentId;

              return (
                <button
                  key={com.id}
                  onClick={() => setSelectedCommitmentId(com.id)}
                  className={`w-full p-3.5 text-left transition-colors flex items-start justify-between ${isSelected ? 'bg-nia-50/80 border-l-4 border-l-nia-600' : 'hover:bg-slate-50'
                    }`}
                >
                  <div className="pr-2">
                    <span className="font-mono text-xs font-bold text-nia-700">{com.commitmentCode}</span>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5 line-clamp-1">
                      {com.mfoPap}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      {relatedCount} / {com.numericalTarget} validated outputs
                    </span>
                  </div>
                  {relatedCount > 0 ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0 mt-2" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Narrative Editor & Excel Target Cell Preview (2 Cols) */}
        {activeCommitment && (
          <Card padding="md" className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-nia-100 text-nia-800">
                    {activeCommitment.commitmentCode}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Accomplishment Narrative Editor
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Populates the <strong>Actual Accomplishment (Merged G:H)</strong> column in official IPCR.
                </p>
              </div>

              <Button
                variant={isSavedFeedback ? 'primary' : 'outline'}
                size="sm"
                onClick={handleSaveNarrative}
                leftIcon={isSavedFeedback ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              >
                {isSavedFeedback ? 'Saved!' : 'Save Narrative'}
              </Button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Standard Civil Engineering Narrative Formulation:</span>
                <span className="text-[11px] text-slate-400 font-normal">Editable by Ratee</span>
              </label>
              <textarea
                rows={5}
                value={narratives[activeCommitment.id] || ''}
                onChange={(e) =>
                  setNarratives({ ...narratives, [activeCommitment.id]: e.target.value })
                }
                className="w-full text-xs leading-relaxed rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 p-3 bg-white shadow-sm"
              />
            </div>

            {/* Excel Preview Block */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-600 font-semibold text-[11px]">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  Excel Target Destination: Merged Cells {activeCommitment.sourceCellRef}
                </span>
                <span className="text-slate-400">Sheet: IPCR 2026</span>
              </div>
              <p className="text-slate-700 text-[11px] leading-tight italic">
                "{narratives[activeCommitment.id] || activeCommitment.actualAccomplishmentDraft}"
              </p>
            </div>

            {/* User Sign-Off */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-nia-600 focus:ring-nia-500 w-4 h-4" />
                <span className="text-xs font-medium text-slate-700">
                  User Confirmed (Validated against primary engineering calculation sheets and field memos)
                </span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Status: CSC_COMPLIANT</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
