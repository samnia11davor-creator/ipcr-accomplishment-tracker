import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Edit3,
  Trash2,
  Layers,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { formatCurrency } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { IpcrCommitment } from '@/types';
import { SemesterSetupModal } from '@/components/commitments/SemesterSetupModal';
import { EditCommitmentModal } from '@/components/commitments/EditCommitmentModal';

export const CommitmentsPage: React.FC = () => {
  const {
    commitments,
    activities,
    selectedPeriod,
    setSelectedPeriod,
    updateCommitment,
    deleteCommitment,
    saveCycleCommitments,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<IpcrCommitment | null>(null);

  const activeActivities = activities.filter((a) => !a.isDeleted);

  // Filter commitments based on search
  const filteredCommitments = commitments.filter((com) => {
    return (
      com.commitmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      com.mfoPap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      com.successIndicator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      com.target.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Group commitments strictly under SPMS Roman Numeral Tiers
  const strategicCommitments = filteredCommitments.filter((c) => c.tier === 'STRATEGIC');
  const coreCommitments = filteredCommitments.filter((c) => c.tier === 'CORE');
  const supportCommitments = filteredCommitments.filter((c) => c.tier === 'SUPPORT');

  const handleSavePeriodCommitments = (
    newCommitments: IpcrCommitment[],
    periodTitle: string
  ) => {
    saveCycleCommitments(newCommitments);
    if (periodTitle.includes('1st Semester')) {
      setSelectedPeriod('SEM1');
    } else {
      setSelectedPeriod('SEM2');
    }
  };

  const renderCommitmentCard = (com: IpcrCommitment, romanNumeral: string) => {
    const completedActs = activeActivities.filter(
      (a) => a.commitmentId === com.id && a.status === 'COMPLETED'
    );
    const ongoingActs = activeActivities.filter(
      (a) => a.commitmentId === com.id && a.status === 'ONGOING'
    );
    const currentCount = completedActs.length;
    const targetCount = com.numericalTarget || 1;
    const progressPct = Math.min(100, Math.round((currentCount / targetCount) * 100));

    return (
      <Card
        key={com.id}
        padding="md"
        className="border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-150"
      >
        {/* Top row: Code, MFO/PAP, Budget, Actions */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <span
              className={`px-3 py-1 rounded-lg font-mono text-xs font-bold shrink-0 ${
                com.tier === 'STRATEGIC'
                  ? 'bg-amber-600 text-white'
                  : com.tier === 'CORE'
                  ? 'bg-nia-700 text-white'
                  : 'bg-emerald-700 text-white'
              }`}
            >
              {romanNumeral}. {com.commitmentCode}
            </span>

            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                {com.mfoPap}
              </div>
              <div className="text-xs text-slate-600 font-medium mt-0.5">
                Accountable: <span className="text-slate-800">{com.accountableDivision}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {com.allottedBudget && (
              <Badge variant="cyan" size="sm">
                Budget: {formatCurrency(com.allottedBudget)}
              </Badge>
            )}
            <button
              onClick={() => setEditingCommitment(com)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 transition-colors"
              title="Edit Success Indicator Narrative"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              Edit Indicator
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Remove ${com.commitmentCode} from this semester's IPCR goals?`)) {
                  deleteCommitment(com.id);
                }
              }}
              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Remove from this semester"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Success Indicator Box */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-nia-600" />
              Approved Success Indicator (Target + Measures Narrative)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Unit: {com.measurementType}
            </span>
          </div>

          <p className="text-xs text-slate-900 font-medium leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
            {com.successIndicator}
          </p>
        </div>

        {/* Feeding Activities Progress */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-800">{completedActs.length}</span> validated outputs
            </div>
            {ongoingActs.length > 0 && (
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-slate-700">{ongoingActs.length}</span> ongoing
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-28 sm:w-36 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  progressPct >= 100 ? 'bg-emerald-500' : 'bg-nia-600'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="font-mono text-slate-700 text-[11px] font-bold">
              {progressPct}%
            </span>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            IPCR Commitment Library & Target Setting
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure baseline approved commitments for each half • Categorized strictly under I. Strategic, II. Core, and III. Support Functions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSetupModalOpen(true)}
            leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
          >
            Set Up Semester IPCR (Target Setting)
          </Button>
        </div>
      </div>

      {/* Cycle Selector & Information Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm" className="p-4 flex items-center justify-between border-l-4 border-l-nia-600 bg-white">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Reporting Period</span>
            <div className="font-bold text-sm text-slate-800 mt-0.5">
              {selectedPeriod === 'SEM1' ? '1st Semester (Jan - Jun)' : '2nd Semester (Jul - Dec)'} 2026
            </div>
            <span className="text-[10px] text-slate-400">Step 1 Targets Locked for Period</span>
          </div>
          <Badge variant="blue">Active Half</Badge>
        </Card>

        <Card padding="sm" className="p-4 flex items-center justify-between border-l-4 border-l-amber-600 bg-white">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">SPMS Structure</span>
            <div className="font-bold text-sm text-slate-800 mt-0.5">
              3-Tier Objective Hierarchy
            </div>
            <span className="text-[10px] text-slate-400">I. Strategic • II. Core • III. Support</span>
          </div>
          <Badge variant="amber">Form 13 Standard</Badge>
        </Card>

        <Card padding="sm" className="p-4 flex items-center justify-between border-l-4 border-l-emerald-600 bg-white">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Indicators</span>
            <div className="font-bold text-sm text-slate-800 mt-0.5">
              {commitments.length} Approved Measures
            </div>
            <span className="text-[10px] text-slate-400">Fed dynamically by daily activity logs</span>
          </div>
          <Badge variant="emerald">100% Monitored</Badge>
        </Card>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search active commitments by code (SM7-A, CF2M8), MFO/PAP, or success indicator text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-nia-500 focus:ring-nia-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-medium">Switch Period:</span>
          <button
            onClick={() => setSelectedPeriod('SEM1')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedPeriod === 'SEM1'
                ? 'bg-nia-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            1st Sem
          </button>
          <button
            onClick={() => setSelectedPeriod('SEM2')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedPeriod === 'SEM2'
                ? 'bg-nia-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            2nd Sem
          </button>
        </div>
      </div>

      {/* COMMITMENTS LIST GROUPED BY ROMAN NUMERAL TIERS */}
      {commitments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No active commitments set for this semester</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            At the start of every half, launch the Commitment Setup wizard to pick your approved objectives from the NIA Master Catalog.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSetupModalOpen(true)}
            leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
          >
            Set Up Semester IPCR (Target Setting)
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* SECTION I. STRATEGIC / PRIORITY THEMES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-lg bg-amber-500 text-white font-bold text-xs">
                  I.
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                    STRATEGIC / PRIORITY THEMES
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    High-impact project deliverables (Feasibility Studies, Detailed Engineering Design, Program of Work)
                  </p>
                </div>
              </div>
              <Badge variant="amber" size="sm">
                {strategicCommitments.length} Indicators
              </Badge>
            </div>

            {strategicCommitments.length === 0 ? (
              <div className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                No strategic priority objectives selected for this period. Click "Set Up Semester IPCR" to configure.
              </div>
            ) : (
              <div className="space-y-3">
                {strategicCommitments.map((com) => renderCommitmentCard(com, 'I'))}
              </div>
            )}
          </div>

          {/* SECTION II. CORE FUNCTIONS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-nia-600">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-lg bg-nia-700 text-white font-bold text-xs">
                  II.
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                    CORE FUNCTIONS
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Sectional mandate operations (Report review/evaluation, field validations, TWG & inter-agency coordination)
                  </p>
                </div>
              </div>
              <Badge variant="blue" size="sm">
                {coreCommitments.length} Indicators
              </Badge>
            </div>

            {coreCommitments.length === 0 ? (
              <div className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                No core function objectives selected for this period. Click "Set Up Semester IPCR" to configure.
              </div>
            ) : (
              <div className="space-y-3">
                {coreCommitments.map((com) => renderCommitmentCard(com, 'II'))}
              </div>
            )}
          </div>

          {/* SECTION III. SUPPORT FUNCTIONS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-600">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs">
                  III.
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                    SUPPORT FUNCTIONS
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Administrative, document archiving, 5S compliance, routing slips, and office assembly attendance
                  </p>
                </div>
              </div>
              <Badge variant="emerald" size="sm">
                {supportCommitments.length} Indicators
              </Badge>
            </div>

            {supportCommitments.length === 0 ? (
              <div className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                No support function objectives selected for this period. Click "Set Up Semester IPCR" to configure.
              </div>
            ) : (
              <div className="space-y-3">
                {supportCommitments.map((com) => renderCommitmentCard(com, 'III'))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Setup Wizard Modal */}
      <SemesterSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSaveCommitments={handleSavePeriodCommitments}
        currentPeriod={selectedPeriod}
      />

      {/* Edit Single Commitment Modal */}
      {editingCommitment && (
        <EditCommitmentModal
          commitment={editingCommitment}
          isOpen={!!editingCommitment}
          onClose={() => setEditingCommitment(null)}
          onSave={(updated) => {
            updateCommitment(updated);
            setEditingCommitment(null);
          }}
        />
      )}
    </div>
  );
};
