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
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ActivityCategory, ActivityStatus, DailyActivity } from '@/types';
import { getCurrentManilaDateString } from '@/lib/dates';
import { useApp } from '@/contexts/AppContext';

const CATEGORIES: ActivityCategory[] = [
  'Technical Review',
  'Feasibility Study',
  'Detailed Engineering',
  'Project Planning',
  'Project Monitoring',
  'Field Inspection',
  'Report Preparation',
  'Report Consolidation',
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form states
  const [activityDate, setActivityDate] = useState<string>(getCurrentManilaDateString());
  const [description, setDescription] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [category, setCategory] = useState<ActivityCategory>('Detailed Engineering');
  const [project, setProject] = useState<string>('Suawan SRIP');
  const [timeSpent, setTimeSpent] = useState<string>('4.0');
  const [status, setStatus] = useState<ActivityStatus>('COMPLETED');
  const [commitmentId, setCommitmentId] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  const resetForm = () => {
    setActivityDate(getCurrentManilaDateString());
    setDescription('');
    setOutput('');
    setCategory('Detailed Engineering');
    setProject('Suawan SRIP');
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
    setCategory(act.category);
    setProject(act.project || '');
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

    if (editingActivityId) {
      const existing = activities.find((a) => a.id === editingActivityId);
      if (existing) {
        updateActivity({
          ...existing,
          activityDate,
          description,
          output,
          category,
          project,
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
        category,
        project,
        timeSpentHours: parseFloat(timeSpent) || 4.0,
        status,
        commitmentId: commitmentId || undefined,
        remarks,
      });
    }

    resetForm();
  };

  // Filter activities
  const activeActivities = activities.filter((a) => !a.isDeleted);

  const filteredActivities = activeActivities.filter((act) => {
    const matchesSearch =
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.output.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.project && act.project.toLowerCase().includes(searchQuery.toLowerCase())) ||
      act.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || act.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'PENDING_AI'
        ? act.classificationStatus === 'PENDING'
        : act.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

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
              DOC LOG Format
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Spreadsheet-grade daily work monitoring • Each recorded engineering task feeds into your active IPCR commitments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Logged</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{activeActivities.length}</div>
          </div>
          <span className="text-xs text-slate-400 font-mono">Entries</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase">Completed</span>
            <div className="text-lg font-bold text-emerald-700 mt-0.5">{completedCount}</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-blue-600 uppercase">Ongoing</span>
            <div className="text-lg font-bold text-blue-700 mt-0.5">{ongoingCount}</div>
          </div>
          <Clock className="w-5 h-5 text-blue-500" />
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-600 uppercase">AI Matching</span>
            <div className="text-lg font-bold text-amber-700 mt-0.5">{pendingAiCount} Pending</div>
          </div>
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>
      </div>

      {/* Collapsible Log Entry Form */}
      {isFormOpen && (
        <Card padding="md" className="border-2 border-nia-600 shadow-lg animate-in fade-in duration-200 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-nia-700 text-white flex items-center justify-center font-bold text-xs">
                  {editingActivityId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingActivityId ? 'Edit Daily Activity Entry' : 'Record New Daily Engineering Work'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter details below. Intelligent AI matching will map your task to the approved IPCR commitment.
                  </p>
                </div>
              </div>
              <Badge variant="blue">Asia/Manila (PHT)</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Activity Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Activity Date *
                </label>
                <input
                  type="date"
                  required
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
                />
              </div>

              {/* Related Project */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                  Related Irrigation Project / System *
                </label>
                <input
                  type="text"
                  required
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="e.g. Suawan SRIP, Pagan SRIP, Mal River, Lupon IS..."
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Activity Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
                >
                  <option value="COMPLETED">Completed</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="DRAFT">Draft</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Hours Spent */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Hours Spent
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="16"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
                />
              </div>

              {/* IPCR Commitment Selection */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned IPCR Goal (Optional - AI will classify automatically)
                </label>
                <select
                  value={commitmentId}
                  onChange={(e) => setCommitmentId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm font-medium"
                >
                  <option value="">Auto-classify with AI based on task description</option>
                  {commitments.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tier === 'STRATEGIC' ? 'I' : c.tier === 'CORE' ? 'II' : 'III'}. {c.commitmentCode} — {c.mfoPap.slice(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Activity Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Activity / Task Description (What engineering work did you do?) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Conducted field inspection and hydraulic validation of canal lining turnout design..."
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
                />
              </div>

              {/* Tangible Output */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tangible Output / Accomplishment (What deliverable was produced?) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  placeholder="e.g. Prepared and submitted technical review comments on canal drawings to Section Chief..."
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
                />
              </div>

              {/* Remarks */}
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Remarks / File Links / Coordination Notes (Optional)
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Coordinated with Davao Oriental IMO Engr. Ramos; document reference #RO-2026-081"
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" type="button" onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                {editingActivityId ? 'Update Activity' : 'Save Daily Activity'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search daily activities by task, tangible output, project name, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-nia-500 focus:ring-nia-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-1.5 px-3 bg-white focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-1.5 px-3 bg-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="ONGOING">Ongoing</option>
            <option value="PENDING_AI">Awaiting AI Confirmation</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* OFFICIAL SPREADSHEET-GRADE ENGINEERING TABLE */}
      {viewMode === 'table' ? (
        <Card padding="none" className="overflow-hidden border border-slate-200 shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1050px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-3.5 w-32">Date / Hours</th>
                  <th className="py-3 px-3.5 w-48">Project & Category</th>
                  <th className="py-3 px-3.5">Activity Description</th>
                  <th className="py-3 px-3.5">Tangible Output</th>
                  <th className="py-3 px-3.5 w-56">IPCR Commitment (Goal)</th>
                  <th className="py-3 px-3.5 w-24 text-center">Status</th>
                  <th className="py-3 px-3.5 w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">No activities match your filters</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Click "Log Daily Work" above to record an activity.</p>
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

                    return (
                      <React.Fragment key={act.id}>
                        <tr
                          className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                            isExpanded ? 'bg-nia-50/40' : ''
                          }`}
                          onClick={() => setExpandedRowId(isExpanded ? null : act.id)}
                        >
                          {/* 1. Date & Hours */}
                          <td className="py-3 px-3.5 align-top">
                            <div className="font-mono font-bold text-slate-900 text-xs">
                              {act.activityDate}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{act.timeSpentHours || 4.0} hrs</span>
                            </div>
                          </td>

                          {/* 2. Project & Category */}
                          <td className="py-3 px-3.5 align-top">
                            <div className="font-bold text-slate-900 truncate max-w-[180px]">
                              {act.project || 'General / Section Work'}
                            </div>
                            <div className="mt-1">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {act.category}
                              </span>
                            </div>
                          </td>

                          {/* 3. Activity Description */}
                          <td className="py-3 px-3.5 align-top">
                            <p className="text-slate-800 line-clamp-2 leading-relaxed">
                              {act.description}
                            </p>
                            {act.remarks && (
                              <p className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
                                Remarks: {act.remarks}
                              </p>
                            )}
                          </td>

                          {/* 4. Tangible Output */}
                          <td className="py-3 px-3.5 align-top">
                            <p className="text-slate-900 font-medium line-clamp-2 leading-relaxed">
                              {act.output}
                            </p>
                          </td>

                          {/* 5. IPCR Commitment & AI */}
                          <td className="py-3 px-3.5 align-top" onClick={(e) => e.stopPropagation()}>
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
                                    className="px-1.5 py-0.5 rounded bg-sky-600 text-white font-bold hover:bg-sky-700 text-[10px]"
                                    title="Confirm AI match"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => rejectClassification(act.id)}
                                    className="px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-300 hover:bg-slate-100 text-[10px]"
                                    title="Change classification"
                                  >
                                    Change
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* 6. Status */}
                          <td className="py-3 px-3.5 align-top text-center">
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
                          <td className="py-3 px-3.5 align-top text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleDuplicate(act)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                                title="Duplicate with today's date"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleEdit(act)}
                                className="p-1 text-slate-400 hover:text-nia-700 rounded hover:bg-nia-50 transition-colors"
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
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setExpandedRowId(isExpanded ? null : act.id)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
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
                            <td colSpan={7} className="p-4 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Complete Task Narrative */}
                                <div className="bg-white p-3 rounded-xl border border-slate-200">
                                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                                    <FileText className="w-3.5 h-3.5 text-nia-600" /> Complete Activity Description
                                  </span>
                                  <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-line font-medium">
                                    {act.description}
                                  </p>
                                </div>

                                {/* Complete Tangible Output */}
                                <div className="bg-white p-3 rounded-xl border border-slate-200">
                                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tangible Output / Accomplishment
                                  </span>
                                  <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-line font-medium">
                                    {act.output}
                                  </p>
                                </div>
                              </div>

                              {/* AI Explanation & Engineering Rationale */}
                              {act.aiClassification && (
                                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs space-y-1">
                                  <div className="flex items-center gap-2 font-bold text-sky-900">
                                    <Sparkles className="w-4 h-4 text-sky-600" />
                                    <span>AI Engineering Rationale ({Math.round(act.aiClassification.confidenceScore * 100)}% Confidence)</span>
                                  </div>
                                  <p className="text-sky-800 text-[11px] leading-relaxed">
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
                              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                                <div className="flex items-center gap-3">
                                  <span>Logged: <strong className="text-slate-700">{act.activityDate}</strong></span>
                                  <span>Time: <strong className="text-slate-700">{act.timeSpentHours || 4.0} hours</strong></span>
                                  <span>Category: <strong className="text-slate-700">{act.category}</strong></span>
                                </div>
                                {act.remarks && (
                                  <div className="text-slate-600">
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
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200"
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
                            className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex justify-between items-center"
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
