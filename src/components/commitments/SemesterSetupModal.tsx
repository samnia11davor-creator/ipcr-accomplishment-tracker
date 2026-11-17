import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Search,
  Sparkles,
  BookOpen,
  PlusCircle,
  HelpCircle,
  CheckSquare,
  Square,
  UserCheck,
} from 'lucide-react';
import { NIA_SPMS_MASTER_CATALOG, NiaCatalogItem } from '@/data/niaMasterCatalog';
import { IpcrCommitment, SpmsTier } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

interface SemesterSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCommitments: (commitments: IpcrCommitment[], periodTitle: string) => void;
  currentPeriod: string;
}

interface SelectedIndicatorState {
  included: boolean;
  successIndicator: string;
  allottedBudget: number | null;
  accountableDivision: string;
  customTarget?: string;
}

export const SemesterSetupModal: React.FC<SemesterSetupModalProps> = ({
  isOpen,
  onClose,
  onSaveCommitments,
  currentPeriod,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<string>(
    currentPeriod === 'SEM1' ? 'SEM1' : 'SEM2'
  );
  const [periodYear, setPeriodYear] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState<'ALL' | SpmsTier>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Start fresh! Do not automatically load previous semester (as instructed by user)
  const [indicatorsState, setIndicatorsState] = useState<Record<string, SelectedIndicatorState>>(() => {
    const state: Record<string, SelectedIndicatorState> = {};
    NIA_SPMS_MASTER_CATALOG.forEach((item) => {
      state[item.code] = {
        included: false,
        successIndicator: item.defaultSuccessIndicator,
        allottedBudget: item.defaultBudget,
        accountableDivision: 'Planning and Design Section / Civil Engineer',
      };
    });
    return state;
  });

  // Custom Objectives added on the fly
  const [customItems, setCustomItems] = useState<NiaCatalogItem[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customTier, setCustomTier] = useState<SpmsTier>('STRATEGIC');
  const [customCode, setCustomCode] = useState('');
  const [customMfo, setCustomMfo] = useState('');
  const [customIndicator, setCustomIndicator] = useState('');

  if (!isOpen) return null;

  const allItems = [...NIA_SPMS_MASTER_CATALOG, ...customItems];

  const handleToggleInclude = (code: string) => {
    setIndicatorsState((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        included: !prev[code]?.included,
      },
    }));
  };

  const handleIndicatorTextChange = (code: string, text: string) => {
    setIndicatorsState((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        successIndicator: text,
      },
    }));
  };

  const handleAccountableChange = (code: string, val: string) => {
    setIndicatorsState((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        accountableDivision: val,
      },
    }));
  };

  // Helper: 1-click select Planning & Design Section Standard Scope
  const handleSelectPdsScope = () => {
    setIndicatorsState((prev) => {
      const next = { ...prev };
      allItems.forEach((item) => {
        if (item.isDefaultPlanningAndDesign) {
          next[item.code] = {
            ...next[item.code],
            included: true,
          };
        }
      });
      return next;
    });
  };

  // Helper: Clear all
  const handleClearAll = () => {
    setIndicatorsState((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        next[k] = { ...next[k], included: false };
      });
      return next;
    });
  };

  const handleAddCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCode.trim() || !customMfo.trim() || !customIndicator.trim()) return;

    const newItem: NiaCatalogItem = {
      code: customCode.trim().toUpperCase(),
      tier: customTier,
      tierRoman: customTier === 'STRATEGIC' ? 'I' : customTier === 'CORE' ? 'II' : 'III',
      tierTitle:
        customTier === 'STRATEGIC'
          ? 'I. STRATEGIC / PRIORITY THEMES'
          : customTier === 'CORE'
          ? 'II. CORE FUNCTIONS'
          : 'III. SUPPORT FUNCTIONS',
      strategicObjective: `CUSTOM ${customTier} ASSIGNMENT`,
      mfoPap: customMfo.trim(),
      measureTitle: customMfo.trim(),
      defaultSuccessIndicator: customIndicator.trim(),
      defaultTarget: customIndicator.trim(),
      measurementType: 'Count',
      defaultBudget: null,
      isDefaultPlanningAndDesign: false,
    };

    setCustomItems((prev) => [...prev, newItem]);
    setIndicatorsState((prev) => ({
      ...prev,
      [newItem.code]: {
        included: true,
        successIndicator: customIndicator.trim(),
        allottedBudget: null,
        accountableDivision: 'Planning and Design Section / Civil Engineer',
      },
    }));

    // Reset custom form
    setCustomCode('');
    setCustomMfo('');
    setCustomIndicator('');
    setShowAddCustom(false);
  };

  // Filter items
  const filteredItems = allItems.filter((item) => {
    const matchesTab = activeTab === 'ALL' || item.tier === activeTab;
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mfoPap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.measureTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.strategicObjective.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Calculate totals
  const selectedCount = Object.values(indicatorsState).filter((s) => s?.included).length;
  const strategicSelected = allItems.filter(
    (i) => i.tier === 'STRATEGIC' && indicatorsState[i.code]?.included
  ).length;
  const coreSelected = allItems.filter(
    (i) => i.tier === 'CORE' && indicatorsState[i.code]?.included
  ).length;
  const supportSelected = allItems.filter(
    (i) => i.tier === 'SUPPORT' && indicatorsState[i.code]?.included
  ).length;

  const handleSaveAll = () => {
    const periodLabel =
      selectedSemester === 'SEM1'
        ? `1st Semester ${periodYear} (January - June ${periodYear})`
        : `2nd Semester ${periodYear} (July - December ${periodYear})`;

    const cycleId = `cycle-${periodYear}-${selectedSemester.toLowerCase()}`;
    const now = new Date().toISOString();

    const selectedCommitments: IpcrCommitment[] = allItems
      .filter((item) => indicatorsState[item.code]?.included)
      .map((item, index) => {
        const state = indicatorsState[item.code];
        return {
          id: `com-${item.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          ownerUid: 'user-engr-sam',
          cycleId,
          tier: item.tier,
          themeCategory:
            item.tier === 'STRATEGIC'
              ? 'SUSTAINABLE IRRIGATION DEVELOPMENT AND SYSTEM MANAGEMENT'
              : undefined,
          strategicObjective: item.strategicObjective,
          mfoPap: item.mfoPap,
          commitmentCode: item.code,
          successIndicator: state.successIndicator || item.defaultSuccessIndicator,
          target: state.successIndicator || item.defaultTarget,
          numericalTarget: item.measurementType === 'Percentage' ? 100 : 1,
          measurementType: item.measurementType,
          allottedBudget: state.allottedBudget,
          accountableDivision: state.accountableDivision,
          actualAccomplishmentDraft: `Actual accomplishments for ${item.code} will be compiled dynamically from validated daily logs.`,
          sourceWorkbook: 'SLT-IPCR-SEMESTER-SETUP.xlsx',
          sourceCellRef: `Row ${index + 12}`,
          rating: { q: 5, e: 5, t: 5, average: 5.0 },
          isActive: true,
          sortOrder: index + 1,
          createdAt: now,
          updatedAt: now,
          schemaVersion: 1,
          isDeleted: false,
        };
      });

    onSaveCommitments(selectedCommitments, periodLabel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-nia-500/20 text-nia-400 border border-nia-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Set Up Semester IPCR (Target Setting)
                <Badge variant="blue" size="sm">Step 1 Baseline</Badge>
              </h2>
              <p className="text-xs text-slate-300">
                Choose the applicable objectives from the NIA SPMS Master Catalog for this half and configure your Success Indicators
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Period Selection & Information Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Reporting Cycle:
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="text-xs font-semibold rounded-lg border border-slate-300 bg-white px-3 py-1.5 focus:ring-nia-500 focus:border-nia-500 text-slate-800"
            >
              <option value="SEM1">1st Semester (January - June)</option>
              <option value="SEM2">2nd Semester (July - December)</option>
            </select>
            <select
              value={periodYear}
              onChange={(e) => setPeriodYear(Number(e.target.value))}
              className="text-xs font-semibold rounded-lg border border-slate-300 bg-white px-3 py-1.5 focus:ring-nia-500 focus:border-nia-500 text-slate-800"
            >
              <option value={2026}>CY 2026</option>
              <option value={2027}>CY 2027</option>
              <option value={2028}>CY 2028</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectPdsScope}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-nia-50 text-nia-700 border border-nia-200 hover:bg-nia-100 flex items-center gap-1.5 transition-all shadow-sm"
              title="One-click select standard Planning & Design commitments (SM7-A, SM7-POW, CF2M8, CF2M9, SF4-A1, SF4-A2, SF4-B)"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-nia-600" />
              Select Planning & Design Scope
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={() => setShowAddCustom(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
              + Add Custom PAP
            </button>
          </div>
        </div>

        {/* Note / Instruction Banner */}
        <div className="px-6 py-2 bg-amber-50/70 border-b border-amber-200/60 flex items-center justify-between text-xs text-amber-900 shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Fresh Start per Half:</strong> Check only the objectives that apply to your desk. Edit the Success Indicator narrative as a single text block. Specific irrigation projects and quantities will be automatically supplied by your daily logs.
            </span>
          </div>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Objectives ({allItems.length})
            </button>
            <button
              onClick={() => setActiveTab('STRATEGIC')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'STRATEGIC'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              I. Strategic Themes ({strategicSelected} / {allItems.filter((i) => i.tier === 'STRATEGIC').length})
            </button>
            <button
              onClick={() => setActiveTab('CORE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'CORE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              II. Core Functions ({coreSelected} / {allItems.filter((i) => i.tier === 'CORE').length})
            </button>
            <button
              onClick={() => setActiveTab('SUPPORT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'SUPPORT'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              III. Support Functions ({supportSelected} / {allItems.filter((i) => i.tier === 'SUPPORT').length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code or title (e.g. SM7, FS, Review)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-nia-500 focus:ring-nia-500"
            />
          </div>
        </div>

        {/* Modal Body: Scrollable Master Catalog List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-100/60">
          {/* Custom PAP Form (if opened) */}
          {showAddCustom && (
            <div className="bg-amber-50/90 border-2 border-amber-300 rounded-xl p-4 shadow-md space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-amber-700" /> Add Custom PAP / Objective
                </span>
                <button
                  onClick={() => setShowAddCustom(false)}
                  className="text-amber-700 hover:text-amber-900 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">SPMS Category *</label>
                  <select
                    value={customTier}
                    onChange={(e) => setCustomTier(e.target.value as SpmsTier)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="STRATEGIC">I. Strategic Priority Theme</option>
                    <option value="CORE">II. Core Function</option>
                    <option value="SUPPORT">III. Support Function</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Commitment Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. SM7-SPECIAL or CF2-ADHOC"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">MFO / PAP Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Special Committee on Climate Resilience"
                    value={customMfo}
                    onChange={(e) => setCustomMfo(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Success Indicator *</label>
                <textarea
                  rows={2}
                  placeholder="Describe the target and measure narrative..."
                  value={customIndicator}
                  onChange={(e) => setCustomIndicator(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                />
              </div>

              <div className="flex justify-end">
                <Button size="sm" variant="primary" onClick={handleAddCustomSubmit}>
                  Add to Active IPCR Catalog
                </Button>
              </div>
            </div>
          )}

          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No matching objectives found</p>
              <p className="text-[11px] text-slate-400 mt-1">Try searching for other terms or clear your search</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isIncluded = indicatorsState[item.code]?.included ?? false;
              const currentState = indicatorsState[item.code] || {
                included: false,
                successIndicator: item.defaultSuccessIndicator,
                allottedBudget: item.defaultBudget,
                accountableDivision: 'Planning and Design Section / Civil Engineer',
              };

              return (
                <div
                  key={item.code}
                  className={`rounded-xl border transition-all duration-150 overflow-hidden ${
                    isIncluded
                      ? 'bg-white border-nia-600 shadow-md ring-1 ring-nia-500/30'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 opacity-90'
                  }`}
                >
                  {/* Item Header / Checkbox row */}
                  <div
                    onClick={() => handleToggleInclude(item.code)}
                    className={`px-4 py-3 cursor-pointer flex items-start gap-3 transition-colors ${
                      isIncluded ? 'bg-nia-50/70 border-b border-nia-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0 text-nia-700">
                      {isIncluded ? (
                        <CheckSquare className="w-5 h-5 text-nia-700" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                            item.tier === 'STRATEGIC'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : item.tier === 'CORE'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {item.tierRoman}. {item.code}
                        </span>

                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                          {item.tierTitle}
                        </span>

                        {item.isDefaultPlanningAndDesign && (
                          <span className="text-[10px] bg-nia-100 text-nia-800 font-bold px-2 py-0.5 rounded-full border border-nia-200">
                            ★ Planning & Design Primary
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 ml-auto">
                          Unit: {item.measurementType}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-1">
                        {item.mfoPap}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.strategicObjective}
                      </p>
                    </div>
                  </div>

                  {/* Expanded Customizer when Checked */}
                  {isIncluded && (
                    <div className="p-4 bg-white space-y-3 border-t border-slate-100 animate-in fade-in">
                      {/* Success Indicator Narrative (Single text area as requested) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                            Success Indicator (Target + Measures Narrative) *
                          </label>
                          <span className="text-[10px] text-slate-400">
                            Editable single text block • Projects and counts will accumulate from daily logs
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={currentState.successIndicator}
                          onChange={(e) => handleIndicatorTextChange(item.code, e.target.value)}
                          placeholder="Edit the approved success indicator narrative for this semester..."
                          className="w-full text-xs rounded-lg border border-slate-200 p-2.5 font-medium leading-relaxed bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-nia-500 focus:border-nia-500"
                        />
                      </div>

                      <div className="pt-1">
                        {/* Accountable Division / Section */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            Accountable Section / Personnel
                          </label>
                          <input
                            type="text"
                            value={currentState.accountableDivision}
                            onChange={(e) => handleAccountableChange(item.code, e.target.value)}
                            placeholder="Planning and Design Section / Civil Engineer"
                            className="w-full text-xs rounded-lg border border-slate-200 px-3 py-1.5 bg-slate-50/50 focus:bg-white focus:ring-nia-500 focus:border-nia-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Footer Action Bar */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-700">
              <span className="font-bold text-slate-900 text-sm">{selectedCount}</span> objectives selected for{' '}
              <span className="font-bold text-nia-800">
                {selectedSemester === 'SEM1' ? '1st Semester' : '2nd Semester'} {periodYear}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-medium">
                {strategicSelected} Strategic
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-medium">
                {coreSelected} Core
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-medium">
                {supportSelected} Support
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={selectedCount === 0}
              onClick={handleSaveAll}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Save & Set as Active IPCR ({selectedCount})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
