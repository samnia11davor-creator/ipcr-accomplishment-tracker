import React, { useState } from 'react';
import {
  Calendar,
  List,
  Plus,
  Search,
  Copy,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  Check,
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

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form states
  const [activityDate, setActivityDate] = useState<string>(getCurrentManilaDateString());
  const [description, setDescription] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [category, setCategory] = useState<ActivityCategory>('Detailed Engineering');
  const [project, setProject] = useState<string>('Digos River Irrigation System Rehabilitation');
  const [timeSpent, setTimeSpent] = useState<string>('4.0');
  const [status, setStatus] = useState<ActivityStatus>('COMPLETED');
  const [commitmentId, setCommitmentId] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  const resetForm = () => {
    setActivityDate(getCurrentManilaDateString());
    setDescription('');
    setOutput('');
    setCategory('Detailed Engineering');
    setProject('Digos River Irrigation System Rehabilitation');
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
  };

  const handleDuplicate = (act: DailyActivity) => {
    addActivity({
      activityDate: getCurrentManilaDateString(),
      description: `[Duplicate] ${act.description}`,
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
    const matchesQuery =
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.output.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.project && act.project.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'ALL' || act.category === selectedCategory;
    const matchesStatus = statusFilter === 'ALL' || act.status === statusFilter;

    return matchesQuery && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Daily Activity Logger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture daily engineering tasks, outputs, and time allocation • Record once, use everywhere
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List ({filteredActivities.length})
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendar
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              if (isFormOpen) {
                resetForm();
              } else {
                setIsFormOpen(true);
              }
            }}
          >
            {isFormOpen ? 'Close Form' : 'New Activity'}
          </Button>
        </div>
      </div>

      {/* Fast Daily Activity Entry Form */}
      {isFormOpen && (
        <Card padding="md" className="border-2 border-nia-200 bg-nia-50/20 shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-nia-600 text-white">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {editingActivityId ? 'Edit Activity Record' : 'Record Daily Work Entry'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Enter details below. Intelligent AI matching will suggest the approved IPCR commitment.
                  </p>
                </div>
              </div>
              <Badge variant="blue">Asia/Manila (PHT)</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Activity Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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

              {/* Status & Hours */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hours Spent
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
              </div>

              {/* Related Project */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Related Irrigation Project / Feasibility Study
                </label>
                <input
                  type="text"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="e.g. Digos River Irrigation System, Padada Dam..."
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
                />
              </div>

              {/* IPCR Commitment Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned IPCR Target
                </label>
                <select
                  value={commitmentId}
                  onChange={(e) => setCommitmentId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
                >
                  <option value="">(Auto-classify with AI)</option>
                  {commitments.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.commitmentCode} - {c.target.slice(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Activity Description */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Activity Description (What engineering task did you work on?) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of technical calculation, review, inspection or design conducted..."
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
                />
              </div>

              {/* Specific Output */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Output / Tangible Deliverable *
                </label>
                <textarea
                  rows={2}
                  required
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  placeholder="Specific deliverable (e.g. 'Drafted 3 sheets structural CAD drawings', 'Prepared review endorsement memo')..."
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
                />
              </div>

              {/* Remarks */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Remarks / Compliance Notes (Optional)
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Conforms with NIA Design Standards, joint inspection with IMO staff..."
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" type="button" onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                {editingActivityId ? 'Update Activity' : 'Save & Log Activity'}
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
            placeholder="Search activities by description, output, project, or commitment..."
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
              <option key={c} value={c}>{c}</option>
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
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Activity List View */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <Card padding="md" className="text-center py-12">
              <p className="text-sm font-semibold text-slate-700">No activities match your filters.</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search query or add a new activity above.</p>
            </Card>
          ) : (
            filteredActivities.map((act) => {
              const matchedCommitment = commitments.find((c) => c.id === act.commitmentId);
              const isPendingClassification = act.classificationStatus === 'PENDING' && act.aiClassification;

              return (
                <Card key={act.id} padding="md" className="hover:border-slate-300 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="blue" size="sm" className="font-mono">
                        {matchedCommitment?.commitmentCode || 'UNCLASSIFIED'}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-800">
                        {matchedCommitment?.mfoPap || 'Awaiting Confirmation'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-mono">{act.activityDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={act.status === 'COMPLETED' ? 'emerald' : 'blue'} size="sm" dot>
                        {act.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{act.timeSpentHours} hrs</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1.5">
                    <p className="text-xs text-slate-800 leading-relaxed">
                      <strong className="text-slate-900">Task: </strong>
                      {act.description}
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                      <span className="font-semibold text-slate-800">Tangible Output: </span>
                      {act.output}
                    </div>
                  </div>

                  {/* AI Classification Suggestion Card (if pending user confirmation) */}
                  {isPendingClassification && (
                    <div className="mt-3 p-3 rounded-lg bg-sky-50/80 border border-sky-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-semibold text-sky-900">
                          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                          <span>AI Classification Match: {matchedCommitment?.commitmentCode} ({Math.round((act.aiClassification?.confidenceScore || 0) * 100)}% confidence)</span>
                        </div>
                        <p className="text-[11px] text-sky-800">{act.aiClassification?.rationale}</p>
                        {act.aiClassification?.missingInformation && (
                          <p className="text-[10px] text-amber-700 font-medium">{act.aiClassification.missingInformation}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="primary"
                          className="text-xs py-1 px-2.5 h-7 bg-sky-600 hover:bg-sky-700"
                          leftIcon={<Check className="w-3 h-3" />}
                          onClick={() => confirmClassification(act.id, act.aiClassification!.suggestedCommitmentId)}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs py-1 px-2.5 h-7"
                          leftIcon={<X className="w-3 h-3" />}
                          onClick={() => rejectClassification(act.id)}
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {act.category}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate max-w-xs">
                        Project: {act.project || 'General'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicate(act)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                        title="Duplicate with new date"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEdit(act)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                        title="Edit activity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Move this activity to trash? It can be restored within 90 days.')) {
                            deleteActivity(act.id);
                          }
                        }}
                        className="p-1 text-rose-400 hover:text-rose-600 rounded hover:bg-rose-50"
                        title="Delete activity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        /* Calendar View */
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
                  const totalHours = dayActs.reduce((acc, curr) => acc + (curr.timeSpentHours || 0), 0);

                  return (
                    <div key={dateStr} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                        <span className="font-semibold text-xs text-slate-900 font-mono">{dateStr}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="blue" size="sm">{dayActs.length} logs</Badge>
                          <span className="text-[11px] text-slate-500 font-medium">{totalHours} total hrs</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {dayActs.map((act) => (
                          <div key={act.id} className="p-2 rounded-lg bg-white border border-slate-100 text-xs flex justify-between items-center">
                            <div className="truncate max-w-xl">
                              <span className="font-semibold text-slate-800">{act.category}: </span>
                              <span className="text-slate-600">{act.description}</span>
                            </div>
                            <Badge variant={act.status === 'COMPLETED' ? 'emerald' : 'blue'} size="sm">
                              {act.status}
                            </Badge>
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
