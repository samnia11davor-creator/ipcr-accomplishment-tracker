import React, { useState } from 'react';
import {
  Calendar,
  Table as TableIcon,
  Plus,
  Search,
  Copy,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  CheckCircle2,
  FileText,
  X,
  RotateCcw,
  Building2,
  Layers,
  PlusCircle,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ActivityStatus, DailyActivity } from '@/types';
import { getCurrentManilaDateString } from '@/lib/dates';
import { useApp } from '@/contexts/AppContext';
import {
  SHEET2_DOC_TYPES,
  SHEET2_PROJECTS,
  SHEET2_OFFICE_SOURCES,
} from '@/data/sheet2MasterData';

const BASE_CATEGORIES = [
  'Detailed Engineering',
  'Technical Review',
  'Feasibility Study',
  'Project Monitoring',
  'Field Inspection',
  'Report Preparation',
  'Report Consolidation',
  'Project Planning',
  'Document Processing',
  'Meetings and Coordination',
  'Administrative',
  'Other',
];

export const ActivitiesPage: React.FC = () => {
  const {
    activities,
    commitments,
    addActivity,
    updateActivity,
    deleteActivity,
    confirmClassification,
    rejectClassification,
  } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Dynamic Projects List (Initialized from Sheet2 of SAM DAILY LOG SHEET.xlsx + custom added)
  const [projectList, setProjectList] = useState<string[]>(() => {
    const saved = localStorage.getItem('ipcr_custom_projects');
    const custom = saved ? JSON.parse(saved) : [];
    return Array.from(new Set([...SHEET2_PROJECTS, ...custom])).sort();
  });

  // Dynamic Doc Types / Categories List (Initialized from Sheet2 of SAM DAILY LOG SHEET.xlsx + categories)
  const [docTypeList, setDocTypeList] = useState<string[]>(() => {
    const saved = localStorage.getItem('ipcr_custom_doctypes');
    const custom = saved ? JSON.parse(saved) : [];
    return Array.from(new Set([...SHEET2_DOC_TYPES, ...BASE_CATEGORIES, ...custom]));
  });

  // Advanced Filtering matching DOC LOG SHEET headers
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [filterYear, setFilterYear] = useState<string>('ALL');
  const [filterCommitment, setFilterCommitment] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateRangePreset, setDateRangePreset] = useState<string>('ALL');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Form states
  const [activityDate, setActivityDate] = useState<string>(getCurrentManilaDateString());
  const [description, setDescription] = useState<string>('');
  const [output, setOutput] = useState<string>('');

  // Project state with "+ Add New Project" support
  const [selectedProject, setSelectedProject] = useState<string>('Suawan SRIP');
  const [isCustomProject, setIsCustomProject] = useState(false);
  const [customProjectInput, setCustomProjectInput] = useState('');

  // Doc Type / Category state with "+ Add New Doc Type" support
  const [selectedCategory, setSelectedCategory] = useState<string>('Detailed Engineering');
  const [isCustomDocType, setIsCustomDocType] = useState(false);
  const [customDocTypeInput, setCustomDocTypeInput] = useState('');

  // Office / Origin state
  const [imoLocation, setImoLocation] = useState<string>('Central Office');
  const [outsideSender, setOutsideSender] = useState<string>('');
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [timeSpent, setTimeSpent] = useState<string>('4.0');
  const [status, setStatus] = useState<ActivityStatus>('COMPLETED');
  const [commitmentId, setCommitmentId] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  const resetForm = () => {
    setActivityDate(getCurrentManilaDateString());
    setDescription('');
    setOutput('');
    setSelectedProject('Suawan SRIP');
    setIsCustomProject(false);
    setCustomProjectInput('');
    setSelectedCategory('Detailed Engineering');
    setIsCustomDocType(false);
    setCustomDocTypeInput('');
    setImoLocation('Central Office');
    setOutsideSender('');
    setCalendarYear(2026);
    setTimeSpent('4.0');
    setStatus('COMPLETED');
    setCommitmentId('');
    setRemarks('');
    setEditingActivityId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (act: DailyActivity) => {
    setEditingActivityId(act.id);
    setActivityDate(act.activityDate);
    setDescription(act.description);
    setOutput(act.output);

    // Project selection
    if (act.project && projectList.includes(act.project)) {
      setSelectedProject(act.project);
      setIsCustomProject(false);
      setCustomProjectInput('');
    } else if (act.project) {
      setSelectedProject('__ADD_NEW__');
      setIsCustomProject(true);
      setCustomProjectInput(act.project);
    } else {
      setSelectedProject('Suawan SRIP');
      setIsCustomProject(false);
      setCustomProjectInput('');
    }

    // Category / Doc Type selection
    if (act.category && docTypeList.includes(act.category)) {
      setSelectedCategory(act.category);
      setIsCustomDocType(false);
      setCustomDocTypeInput('');
    } else if (act.category) {
      setSelectedCategory('__ADD_NEW__');
      setIsCustomDocType(true);
      setCustomDocTypeInput(act.category);
    } else {
      setSelectedCategory('Detailed Engineering');
      setIsCustomDocType(false);
      setCustomDocTypeInput('');
    }

    // Origin / Source
    if (act.imoLocation && SHEET2_OFFICE_SOURCES.includes(act.imoLocation as typeof SHEET2_OFFICE_SOURCES[number])) {
      setImoLocation(act.imoLocation);
      setOutsideSender('');
    } else if (act.imoLocation) {
      setImoLocation('Others (Outside)');
      setOutsideSender(act.imoLocation);
    } else {
      setImoLocation('Regional Office XI');
      setOutsideSender('');
    }

    setCalendarYear(act.calendarYear || 2026);
    setTimeSpent(String(act.timeSpentHours || 4.0));
    setStatus(act.status);
    setCommitmentId(act.commitmentId || '');
    setRemarks(act.remarks || '');
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicate = (act: DailyActivity) => {
    addActivity({
      activityDate: getCurrentManilaDateString(),
      description: `[Follow-up] ${act.description}`,
      output: act.output,
      category: act.category,
      project: act.project,
      imoLocation: act.imoLocation,
      calendarYear: act.calendarYear,
      timeSpentHours: act.timeSpentHours,
      status: 'ONGOING',
      commitmentId: act.commitmentId,
      remarks: act.remarks,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !output.trim()) {
      alert('Please enter both Activity Description and Tangible Output.');
      return;
    }

    // Resolve Project Name
    let finalProject = selectedProject;
    if (selectedProject === '__ADD_NEW__') {
      if (!customProjectInput.trim()) {
        alert('Please enter the new project name or select an existing one.');
        return;
      }
      finalProject = customProjectInput.trim();
      // Add to dynamic list and persist
      if (!projectList.includes(finalProject)) {
        const updated = [...projectList, finalProject].sort();
        setProjectList(updated);
        localStorage.setItem(
          'ipcr_custom_projects',
          JSON.stringify(updated.filter((p) => !SHEET2_PROJECTS.includes(p)))
        );
      }
    }

    // Resolve Category / Doc Type
    let finalCategory = selectedCategory;
    if (selectedCategory === '__ADD_NEW__') {
      if (!customDocTypeInput.trim()) {
        alert('Please enter the new document type or category name.');
        return;
      }
      finalCategory = customDocTypeInput.trim();
      if (!docTypeList.includes(finalCategory)) {
        const updated = [...docTypeList, finalCategory];
        setDocTypeList(updated);
        localStorage.setItem(
          'ipcr_custom_doctypes',
          JSON.stringify(
            updated.filter(
              (d) =>
                !SHEET2_DOC_TYPES.includes(d as typeof SHEET2_DOC_TYPES[number]) &&
                !BASE_CATEGORIES.includes(d)
            )
          )
        );
      }
    }

    // Resolve Office Origin
    const resolvedLocation =
      imoLocation === 'Others (Outside)' && outsideSender.trim()
        ? `Others (${outsideSender.trim()})`
        : imoLocation;

    if (editingActivityId) {
      const existing = activities.find((a) => a.id === editingActivityId);
      if (existing) {
        updateActivity({
          ...existing,
          activityDate,
          description,
          output,
          category: finalCategory,
          project: finalProject,
          imoLocation: resolvedLocation,
          calendarYear,
          timeSpentHours: parseFloat(timeSpent) || 4.0,
          status,
          commitmentId: commitmentId || existing.commitmentId,
          remarks,
        });
      }
    } else {
      addActivity({
        activityDate,
        description,
        output,
        category: finalCategory,
        project: finalProject,
        imoLocation: resolvedLocation,
        calendarYear,
        timeSpentHours: parseFloat(timeSpent) || 4.0,
        status,
        commitmentId: commitmentId || undefined,
        remarks,
      });
    }

    resetForm();
  };

  // Distinct filter options extracted from existing records
  const activeActivities = activities.filter((a) => !a.isDeleted);

  const uniqueProjectsForFilter = Array.from(
    new Set([
      ...projectList,
      ...activeActivities
        .map((a) => a.project)
        .filter((p): p is string => Boolean(p && p.trim().length > 0)),
    ])
  ).sort();

  const uniqueYears = Array.from(
    new Set([
      '2026',
      '2027',
      '2025',
      ...activeActivities.map((a) =>
        a.calendarYear ? String(a.calendarYear) : a.activityDate?.slice(0, 4)
      ),
    ])
  )
    .filter(Boolean)
    .sort()
    .reverse();

  // Multi-dimensional filtering logic
  const filteredActivities = activeActivities.filter((act) => {
    // 1. Global Search
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      act.description.toLowerCase().includes(query) ||
      act.output.toLowerCase().includes(query) ||
      (act.project && act.project.toLowerCase().includes(query)) ||
      (act.imoLocation && act.imoLocation.toLowerCase().includes(query)) ||
      (act.remarks && act.remarks.toLowerCase().includes(query)) ||
      act.category.toLowerCase().includes(query);

    // 2. Project
    const matchesProject = filterProject === 'ALL' || act.project === filterProject;

    // 3. Category / Doc Type
    const matchesCategory = filterCategory === 'ALL' || act.category === filterCategory;

    // 4. Source / Office Origin
    const matchesSource =
      filterSource === 'ALL'
        ? true
        : filterSource === 'Others (Outside)'
        ? act.imoLocation?.includes('Others')
        : act.imoLocation === filterSource;

    // 5. Calendar Year
    const actYear = String(act.calendarYear || act.activityDate?.slice(0, 4));
    const matchesYear = filterYear === 'ALL' || actYear === filterYear;

    // 6. IPCR Commitment
    const matchesCommitment =
      filterCommitment === 'ALL'
        ? true
        : filterCommitment === 'UNCLASSIFIED'
        ? !act.commitmentId
        : act.commitmentId === filterCommitment;

    // 7. Status
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'PENDING_AI'
        ? act.classificationStatus === 'PENDING'
        : act.status === statusFilter;

    // 8. Date Range / Duration
    let matchesDate = true;
    if (dateRangePreset === 'THIS_MONTH') {
      const nowMonth = getCurrentManilaDateString().slice(0, 7);
      matchesDate = act.activityDate.startsWith(nowMonth);
    } else if (dateRangePreset === 'LAST_30') {
      const today = new Date();
      const past30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      matchesDate = act.activityDate >= past30;
    } else if (dateRangePreset === 'SEM1') {
      matchesDate = act.activityDate >= '2026-01-01' && act.activityDate <= '2026-06-30';
    } else if (dateRangePreset === 'SEM2') {
      matchesDate = act.activityDate >= '2026-07-01' && act.activityDate <= '2026-12-31';
    } else if (dateRangePreset === 'CUSTOM') {
      if (customStartDate && act.activityDate < customStartDate) matchesDate = false;
      if (customEndDate && act.activityDate > customEndDate) matchesDate = false;
    }

    return (
      matchesSearch &&
      matchesProject &&
      matchesCategory &&
      matchesSource &&
      matchesYear &&
      matchesCommitment &&
      matchesStatus &&
      matchesDate
    );
  });

  // Calculate active filters count
  const activeFiltersCount = [
    filterProject !== 'ALL',
    filterCategory !== 'ALL',
    filterSource !== 'ALL',
    filterYear !== 'ALL',
    filterCommitment !== 'ALL',
    statusFilter !== 'ALL',
    dateRangePreset !== 'ALL',
    Boolean(searchQuery.trim()),
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    setSearchQuery('');
    setFilterProject('ALL');
    setFilterCategory('ALL');
    setFilterSource('ALL');
    setFilterYear('ALL');
    setFilterCommitment('ALL');
    setStatusFilter('ALL');
    setDateRangePreset('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const completedCount = activeActivities.filter((a) => a.status === 'COMPLETED').length;
  const ongoingCount = activeActivities.filter((a) => a.status === 'ONGOING').length;
  const pendingAiCount = activeActivities.filter((a) => a.classificationStatus === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            Daily Activity Logsheet
            <Badge variant="blue" size="sm" className="font-normal font-sans">
              Sheet2 Verified
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Spreadsheet-grade daily work monitoring • Preloaded with official NIA Region XI projects & doc types from your Sheet2 master list
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Table View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Date Groups
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (isFormOpen && !editingActivityId) {
                setIsFormOpen(false);
              } else {
                resetForm();
                setIsFormOpen(true);
              }
            }}
            leftIcon={isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          >
            {isFormOpen ? 'Close Form' : 'Log Daily Work'}
          </Button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Filtered Records</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {filteredActivities.length} <span className="text-xs font-normal text-slate-400">/ {activeActivities.length} total</span>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">Entries</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">Completed</span>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{completedCount}</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">Ongoing</span>
            <div className="text-xl font-bold text-blue-700 mt-0.5">{ongoingCount}</div>
          </div>
          <Clock className="w-5 h-5 text-blue-500" />
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide">AI Matching</span>
            <div className="text-xl font-bold text-amber-700 mt-0.5">{pendingAiCount} Pending</div>
          </div>
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>
      </div>

      {/* Spacious, Highly-Organized Log Entry Form with Sheet2 Dropdowns */}
      {isFormOpen && (
        <Card padding="md" className="border-2 border-nia-600 shadow-xl rounded-2xl animate-in fade-in duration-200 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Top Title */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-nia-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {editingActivityId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingActivityId ? 'Edit Daily Engineering Entry' : 'Record New Daily Engineering Work'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select from approved Sheet2 project names & doc types to prevent typing errors, or add new ones anytime.
                  </p>
                </div>
              </div>
              <Badge variant="blue" size="md">Asia/Manila (PHT)</Badge>
            </div>

            {/* SECTION 1: Origin & Project Details */}
            <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-nia-600" />
                <span>1. Task Origin & Project Identification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Activity Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Activity Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-sm"
                  />
                </div>

                {/* Where the file/task is coming from */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-nia-600" />
                    Source / Office Origin *
                  </label>
                  <select
                    value={imoLocation}
                    onChange={(e) => setImoLocation(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-sm font-semibold text-slate-800"
                  >
                    {SHEET2_OFFICE_SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Related Project (Sheet2 Dropdown + Add Option) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                      Related Project *
                    </span>
                    <span className="text-[10px] text-nia-700 font-medium">Sheet2 Catalog</span>
                  </label>
                  <select
                    value={isCustomProject ? '__ADD_NEW__' : selectedProject}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setIsCustomProject(true);
                      } else {
                        setIsCustomProject(false);
                        setSelectedProject(e.target.value);
                      }
                    }}
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-sm font-medium text-slate-800"
                  >
                    <optgroup label="Official Region XI Projects">
                      {projectList.map((proj) => (
                        <option key={proj} value={proj}>
                          {proj}
                        </option>
                      ))}
                    </optgroup>
                    <option value="__ADD_NEW__" className="text-nia-700 font-bold">
                      + Add New Project (Not in list)...
                    </option>
                  </select>
                </div>

                {/* Calendar Year */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Calendar Year (CY) *
                  </label>
                  <select
                    value={calendarYear}
                    onChange={(e) => setCalendarYear(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-sm"
                  >
                    <option value={2026}>CY 2026</option>
                    <option value={2027}>CY 2027</option>
                    <option value={2025}>CY 2025</option>
                    <option value={2024}>CY 2024</option>
                    <option value={2023}>CY 2023</option>
                  </select>
                </div>

                {/* If Custom Project chosen, show animated text input */}
                {isCustomProject && (
                  <div className="sm:col-span-2 lg:col-span-4 bg-amber-50/80 p-3.5 rounded-xl border border-amber-300 animate-in fade-in space-y-1.5">
                    <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
                      Type New Project Name (Will be saved to your dropdown permanently) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={customProjectInput}
                        onChange={(e) => setCustomProjectInput(e.target.value)}
                        placeholder="e.g. New Irrigation System / Reservoir Project Name"
                        className="w-full text-xs rounded-xl border border-amber-300 bg-white px-3.5 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomProject(false);
                          setSelectedProject(projectList[0] || 'Suawan SRIP');
                        }}
                        className="px-3 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* If "Others (Outside)" selected, show specific agency input */}
                {imoLocation === 'Others (Outside)' && (
                  <div className="sm:col-span-2 lg:col-span-4 bg-purple-50/80 p-3.5 rounded-xl border border-purple-200 animate-in fade-in space-y-1.5">
                    <label className="block text-xs font-bold text-purple-900">
                      Specify Outside Agency / Entity Name (e.g. LGU Mati, Provincial Agriculture Office, Consultant) *
                    </label>
                    <input
                      type="text"
                      required
                      value={outsideSender}
                      onChange={(e) => setOutsideSender(e.target.value)}
                      placeholder="e.g. Provincial Agriculture Office, Woodfields Consultants, LGU Bansalan..."
                      className="w-full text-xs rounded-xl border border-purple-300 bg-white px-3.5 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: Category & IPCR Target Goal */}
            <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-nia-600" />
                <span>2. Engineering Scope & IPCR Goal Target</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Doc Type / Category (Sheet2 Dropdown + Add Option) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Doc Type / Category *</span>
                    <span className="text-[10px] text-nia-700 font-medium">Sheet2 Types</span>
                  </label>
                  <select
                    value={isCustomDocType ? '__ADD_NEW__' : selectedCategory}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setIsCustomDocType(true);
                      } else {
                        setIsCustomDocType(false);
                        setSelectedCategory(e.target.value);
                      }
                    }}
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-sm font-medium text-slate-800"
                  >
                    <optgroup label="Official Sheet2 Document Types">
                      {SHEET2_DOC_TYPES.map((dt) => (
                        <option key={dt} value={dt}>
                          {dt}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Engineering Activity Categories">
                      {BASE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </optgroup>
                    <option value="__ADD_NEW__" className="text-nia-700 font-bold">
                      + Add Custom Doc Type / Category...
                    </option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-sm"
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="DRAFT">Draft</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {/* Hours Spent */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Hours Spent
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="16"
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-sm"
                  />
                </div>

                {/* IPCR Commitment Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Assigned IPCR Goal
                  </label>
                  <select
                    value={commitmentId}
                    onChange={(e) => setCommitmentId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-sm font-semibold"
                  >
                    <option value="">Auto-classify with AI</option>
                    {commitments.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.tier === 'STRATEGIC' ? 'I' : c.tier === 'CORE' ? 'II' : 'III'}. {c.commitmentCode} — {c.mfoPap.slice(0, 35)}...
                      </option>
                    ))}
                  </select>
                </div>

                {/* If Custom Doc Type chosen, show input */}
                {isCustomDocType && (
                  <div className="sm:col-span-2 lg:col-span-4 bg-blue-50/80 p-3.5 rounded-xl border border-blue-300 animate-in fade-in space-y-1.5">
                    <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5 text-blue-700" />
                      Type Custom Document Type or Category *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={customDocTypeInput}
                        onChange={(e) => setCustomDocTypeInput(e.target.value)}
                        placeholder="e.g. SPECIAL ORDER, DED ENDORSEMENT"
                        className="w-full text-xs rounded-xl border border-blue-300 bg-white px-3.5 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomDocType(false);
                          setSelectedCategory('Detailed Engineering');
                        }}
                        className="px-3 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: Task Description & Output Narratives */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Activity Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Activity / Task Description (What engineering work did you do?) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Conducted technical review and evaluated hydraulic design calculations of canal lining turnout..."
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 p-3 bg-white shadow-sm font-medium leading-relaxed"
                  />
                </div>

                {/* Tangible Output */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Tangible Output / Accomplishment (What deliverable was produced?) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={output}
                    onChange={(e) => setOutput(e.target.value)}
                    placeholder="e.g. Prepared and submitted technical review memorandum with comments to Section Chief..."
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 p-3 bg-white shadow-sm font-medium leading-relaxed"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Remarks / Transmission Means / File Ref Codes (Optional)
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Hand-carried by IMO courier; official reference letter #RO-2026-081"
                  className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="secondary" size="md" type="button" onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                {editingActivityId ? 'Update Activity' : 'Save Daily Activity'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* CLEAN, WELL-ORGANIZED & BALANCED FILTER BAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Top Filter Bar: Search + Active Summary */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search description, output deliverable, project name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 bg-slate-50/70"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {activeFiltersCount > 0 ? (
              <span className="px-3 py-1 rounded-full bg-nia-100 text-nia-800 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-nia-600 animate-pulse" />
                {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''} applied
              </span>
            ) : (
              <span className="text-xs text-slate-400">All filters default</span>
            )}

            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-slate-600 hover:text-rose-600 flex items-center gap-1 font-semibold transition-colors bg-slate-100 hover:bg-rose-50 px-3 py-1 rounded-lg border border-slate-200"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Balanced 4-Column Dropdown Grid with generous spacing and Sheet2 selections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          {/* 1. Project Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
              Project Name ({uniqueProjectsForFilter.length})
            </label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 text-slate-800 font-medium shadow-sm"
            >
              <option value="ALL">All Projects ({uniqueProjectsForFilter.length})</option>
              {uniqueProjectsForFilter.map((proj) => (
                <option key={proj} value={proj}>
                  {proj}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Source / Office Origin */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
              Source / Office Origin
            </label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 text-slate-800 font-medium shadow-sm"
            >
              <option value="ALL">All Sources & Offices</option>
              {SHEET2_OFFICE_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Category / Doc Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
              Category / Doc Type
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 text-slate-800 font-medium shadow-sm"
            >
              <option value="ALL">All Categories & Doc Types</option>
              <optgroup label="Official Sheet2 Doc Types">
                {SHEET2_DOC_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Engineering Categories">
                {BASE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* 4. Date Duration Preset */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
              Date Duration
            </label>
            <select
              value={dateRangePreset}
              onChange={(e) => setDateRangePreset(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 text-slate-800 font-medium shadow-sm"
            >
              <option value="ALL">All Dates</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_30">Last 30 Days</option>
              <option value="SEM2">2nd Sem (Jul - Dec 2026)</option>
              <option value="SEM1">1st Sem (Jan - Jun 2026)</option>
              <option value="CUSTOM">Custom Date Range...</option>
            </select>
          </div>

          {/* 5. Calendar Year */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
              Calendar Year
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 text-slate-800 font-medium shadow-sm"
            >
              <option value="ALL">All CY</option>
              {uniqueYears.map((yr) => (
                <option key={yr} value={yr}>
                  CY {yr}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Target IPCR Goal */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
              Target IPCR Goal
            </label>
            <select
              value={filterCommitment}
              onChange={(e) => setFilterCommitment(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 text-slate-800 font-medium shadow-sm"
            >
              <option value="ALL">All IPCR Goals</option>
              {commitments.map((com) => (
                <option key={com.id} value={com.id}>
                  {com.commitmentCode} - {com.target.slice(0, 24)}...
                </option>
              ))}
              <option value="UNCLASSIFIED">Unclassified</option>
            </select>
          </div>

          {/* 7. Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 text-slate-800 font-medium shadow-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="ONGOING">Ongoing</option>
              <option value="PENDING_AI">Awaiting AI Match</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          {/* 8. Custom Date Pickers */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
              {dateRangePreset === 'CUSTOM' ? 'Custom Range (From - To)' : 'Date Mode'}
            </label>
            {dateRangePreset === 'CUSTOM' ? (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-1/2 text-xs rounded-xl border border-slate-200 py-1.5 px-2 bg-white text-slate-800 shadow-sm"
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-1/2 text-xs rounded-xl border border-slate-200 py-1.5 px-2 bg-white text-slate-800 shadow-sm"
                />
              </div>
            ) : (
              <div className="w-full text-xs py-2 px-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 italic">
                Preset active: {dateRangePreset === 'ALL' ? 'All dates' : dateRangePreset}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OFFICIAL SPREADSHEET-GRADE ENGINEERING TABLE */}
      {viewMode === 'table' ? (
        <Card padding="none" className="overflow-hidden border border-slate-200 shadow-sm bg-white rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-32">Date / Hours</th>
                  <th className="py-3.5 px-4 w-60">Project & Office Origin</th>
                  <th className="py-3.5 px-4">Activity Description</th>
                  <th className="py-3.5 px-4">Tangible Output Deliverable</th>
                  <th className="py-3.5 px-4 w-56">IPCR Commitment (Goal)</th>
                  <th className="py-3.5 px-4 w-24 text-center">Status</th>
                  <th className="py-3.5 px-4 w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-14 text-slate-400">
                      <FileText className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">No activities match your filters</p>
                      <p className="text-[11px] text-slate-400 mt-1">Try resetting the filters or click "Log Daily Work" to add one.</p>
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((act) => {
                    const matchedCommitment = commitments.find((c) => c.id === act.commitmentId);
                    const isPendingClassification =
                      act.classificationStatus === 'PENDING' && act.aiClassification;
                    const isExpanded = expandedRowId === act.id;

                    const romanTier =
                      matchedCommitment?.tier === 'STRATEGIC'
                        ? 'I'
                        : matchedCommitment?.tier === 'CORE'
                        ? 'II'
                        : matchedCommitment?.tier === 'SUPPORT'
                        ? 'III'
                        : '';

                    const isCentralOffice = act.imoLocation?.includes('Central Office');
                    const isOutside = act.imoLocation?.includes('Others');

                    return (
                      <React.Fragment key={act.id}>
                        <tr
                          className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                            isExpanded ? 'bg-nia-50/40' : ''
                          }`}
                          onClick={() => setExpandedRowId(isExpanded ? null : act.id)}
                        >
                          {/* 1. Date & Hours */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="font-mono font-bold text-slate-900 text-xs">
                              {act.activityDate}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{act.timeSpentHours || 4.0} hrs</span>
                            </div>
                          </td>

                          {/* 2. Project & Office Origin */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="font-bold text-slate-900 leading-snug">
                              {act.project || 'General / Section Work'}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              {/* Office Origin Badge */}
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  isCentralOffice
                                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                                    : isOutside
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {act.imoLocation || 'Regional Office XI'}
                              </span>

                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] text-slate-600 bg-slate-50 border border-slate-200">
                                {act.category}
                              </span>

                              {act.calendarYear && (
                                <span className="text-[10px] font-mono text-slate-400">
                                  CY {act.calendarYear}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 3. Activity Description */}
                          <td className="py-3.5 px-4 align-top">
                            <p className="text-slate-800 line-clamp-2 leading-relaxed">
                              {act.description}
                            </p>
                            {act.remarks && (
                              <p className="text-[11px] text-slate-400 truncate max-w-sm mt-1">
                                Ref/Notes: {act.remarks}
                              </p>
                            )}
                          </td>

                          {/* 4. Tangible Output */}
                          <td className="py-3.5 px-4 align-top">
                            <p className="text-slate-900 font-medium line-clamp-2 leading-relaxed">
                              {act.output}
                            </p>
                          </td>

                          {/* 5. IPCR Commitment & AI */}
                          <td className="py-3.5 px-4 align-top" onClick={(e) => e.stopPropagation()}>
                            {matchedCommitment ? (
                              <div className="space-y-1">
                                <span
                                  className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                                    matchedCommitment.tier === 'STRATEGIC'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : matchedCommitment.tier === 'CORE'
                                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  }`}
                                >
                                  {romanTier}. {matchedCommitment.commitmentCode}
                                </span>
                                <div className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">
                                  {matchedCommitment.mfoPap}
                                </div>
                              </div>
                            ) : (
                              <Badge variant="rose" size="sm">
                                Unclassified
                              </Badge>
                            )}

                            {/* Inline AI Quick Match Actions */}
                            {isPendingClassification && (
                              <div className="mt-1.5 p-1.5 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-between gap-1 text-[11px]">
                                <span className="text-sky-800 font-medium flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-sky-600" />
                                  {Math.round((act.aiClassification?.confidenceScore || 0) * 100)}% match
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      confirmClassification(
                                        act.id,
                                        act.aiClassification!.suggestedCommitmentId
                                      )
                                    }
                                    className="px-2 py-0.5 rounded bg-sky-600 text-white font-bold hover:bg-sky-700 text-[10px]"
                                    title="Confirm AI match"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => rejectClassification(act.id)}
                                    className="px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-300 hover:bg-slate-100 text-[10px]"
                                    title="Change classification"
                                  >
                                    Change
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* 6. Status */}
                          <td className="py-3.5 px-4 align-top text-center">
                            <Badge
                              variant={
                                act.status === 'COMPLETED'
                                  ? 'emerald'
                                  : act.status === 'ONGOING'
                                  ? 'blue'
                                  : 'slate'
                              }
                              size="sm"
                              dot
                            >
                              {act.status}
                            </Badge>
                          </td>

                          {/* 7. Action buttons */}
                          <td className="py-3.5 px-4 align-top text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleDuplicate(act)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Duplicate with today's date"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleEdit(act)}
                                className="p-1.5 text-slate-400 hover:text-nia-700 rounded-lg hover:bg-nia-50 transition-colors"
                                title="Edit activity"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Move this activity to trash?')) {
                                    deleteActivity(act.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setExpandedRowId(isExpanded ? null : act.id)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Expand details"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED ROW ACCORDION: Shows 100% of the engineering details */}
                        {isExpanded && (
                          <tr className="bg-slate-50 border-b border-slate-200 animate-in fade-in">
                            <td colSpan={7} className="p-5 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Complete Task Narrative */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                                    <FileText className="w-4 h-4 text-nia-600" /> Complete Activity Description
                                  </span>
                                  <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-line font-medium">
                                    {act.description}
                                  </p>
                                </div>

                                {/* Complete Tangible Output */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tangible Output / Accomplishment
                                  </span>
                                  <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-line font-medium">
                                    {act.output}
                                  </p>
                                </div>
                              </div>

                              {/* AI Explanation & Engineering Rationale */}
                              {act.aiClassification && (
                                <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-xs space-y-1.5">
                                  <div className="flex items-center gap-2 font-bold text-sky-900">
                                    <Sparkles className="w-4 h-4 text-sky-600" />
                                    <span>AI Engineering Rationale ({Math.round(act.aiClassification.confidenceScore * 100)}% Confidence)</span>
                                  </div>
                                  <p className="text-sky-800 text-xs leading-relaxed">
                                    {act.aiClassification.rationale}
                                  </p>
                                  {act.aiClassification.missingInformation && (
                                    <p className="text-amber-800 text-[11px] font-medium pt-1">
                                      ⚠️ Notice: {act.aiClassification.missingInformation}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Metadata & Remarks */}
                              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
                                <div className="flex flex-wrap items-center gap-4">
                                  <span>Logged Date: <strong className="text-slate-800 font-mono">{act.activityDate}</strong></span>
                                  <span>Duration: <strong className="text-slate-800">{act.timeSpentHours || 4.0} hours</strong></span>
                                  <span>Category: <strong className="text-slate-800">{act.category}</strong></span>
                                  <span>Origin / Sender: <strong className="text-slate-800">{act.imoLocation || 'Regional Office XI'}</strong></span>
                                  {act.calendarYear && <span>CY: <strong className="text-slate-800">{act.calendarYear}</strong></span>}
                                </div>
                                {act.remarks && (
                                  <div className="text-slate-700 font-medium">
                                    <strong>Remarks:</strong> {act.remarks}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Calendar / Date Groups View */
        <div className="space-y-4">
          <Card padding="md">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-nia-600" />
              Activities Grouped by Work Date
            </h3>
            <div className="space-y-4">
              {Array.from(new Set(filteredActivities.map((a) => a.activityDate)))
                .sort()
                .reverse()
                .map((dateStr) => {
                  const dayActs = filteredActivities.filter((a) => a.activityDate === dateStr);
                  const totalHours = dayActs.reduce(
                    (acc, curr) => acc + (curr.timeSpentHours || 0),
                    0
                  );

                  return (
                    <div
                      key={dateStr}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                        <span className="font-semibold text-xs text-slate-900 font-mono">
                          {dateStr}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="blue" size="sm">
                            {dayActs.length} logs
                          </Badge>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {totalHours} total hrs
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {dayActs.map((act) => (
                          <div
                            key={act.id}
                            className="p-3 rounded-lg bg-white border border-slate-200 text-xs flex justify-between items-center"
                          >
                            <div className="truncate max-w-xl">
                              <span className="font-semibold text-slate-800">
                                [{act.project || 'General'}] {act.category}:{' '}
                              </span>
                              <span className="text-slate-600">{act.description}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={act.status === 'COMPLETED' ? 'emerald' : 'blue'}
                                size="sm"
                              >
                                {act.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
