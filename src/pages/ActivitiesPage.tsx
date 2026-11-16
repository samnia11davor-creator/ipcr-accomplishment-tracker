import React, { useState } from 'react';
import {
  Calendar,
  List,
  Plus,
  Search,
  Copy,
  Edit2,
  Paperclip,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ActivityCategory, ActivityStatus } from '@/types';
import { getCurrentManilaDateString } from '@/lib/dates';

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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Form states
  const [activityDate, setActivityDate] = useState<string>(getCurrentManilaDateString());
  const [description, setDescription] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [category, setCategory] = useState<ActivityCategory>('Detailed Engineering');
  const [project, setProject] = useState<string>('Digos River Irrigation System Rehabilitation');
  const [timeSpent, setTimeSpent] = useState<string>('4.0');
  const [status, setStatus] = useState<ActivityStatus>('COMPLETED');

  // Sample static activities representing Phase 0 state
  const sampleActivities = [
    {
      id: 'act-001',
      date: '2026-11-16',
      description: 'Conducted structural cross-section analysis and hydraulic capacity calculation for the proposed cut-off wall at Sta. 4+250.',
      output: 'Hydraulic stability check report with calculation sheets attached.',
      category: 'Detailed Engineering' as ActivityCategory,
      project: 'Digos River Irrigation System Rehabilitation',
      timeSpent: 4.5,
      status: 'COMPLETED' as ActivityStatus,
      commitmentCode: 'C-01',
      commitmentName: 'Detailed Engineering Design (DED)',
      supportingDocs: 2,
    },
    {
      id: 'act-002',
      date: '2026-11-15',
      description: 'Conducted technical review of the submitted Inception Report and Geotechnical Soil Investigation for Padada River Dam Study.',
      output: 'Review findings memo with comments on SPT borehole N-values.',
      category: 'Technical Review' as ActivityCategory,
      project: 'Padada River Dam Study',
      timeSpent: 3.0,
      status: 'COMPLETED' as ActivityStatus,
      commitmentCode: 'C-02',
      commitmentName: 'Technical Review of Feasibility Studies (FS)',
      supportingDocs: 1,
    },
    {
      id: 'act-003',
      date: '2026-11-14',
      description: 'Attended coordination meeting with Davao del Sur IMO field engineers regarding right-of-way (ROW) alignment obstacles along Main Canal 2.',
      output: 'Minutes of Meeting and agreed joint site verification schedule.',
      category: 'Meetings and Coordination' as ActivityCategory,
      project: 'Hagonoy Communal Irrigation Project',
      timeSpent: 2.5,
      status: 'COMPLETED' as ActivityStatus,
      commitmentCode: 'C-04',
      commitmentName: 'Coordination and Stakeholder Engagements',
      supportingDocs: 1,
    },
  ];

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
              List
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
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            {isFormOpen ? 'Close Form' : 'New Activity'}
          </Button>
        </div>
      </div>

      {/* Fast Daily Activity Entry Form (Collapsible/Inline) */}
      {isFormOpen && (
        <Card padding="md" className="border-2 border-nia-200 bg-nia-50/20 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-nia-600 text-white">
                <Plus className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Record Daily Work Entry</h3>
                <p className="text-[11px] text-slate-500">
                  Fill in your accomplishment details. The AI matching engine will correlate with approved IPCR targets.
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
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
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
                className="w-full text-xs rounded-lg border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
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
                  className="w-full text-xs rounded-lg border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
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
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(e.target.value)}
                  placeholder="e.g. 4.0"
                  className="w-full text-xs rounded-lg border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
                />
              </div>
            </div>

            {/* Related Project */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Related Irrigation Project / Feasibility Study
              </label>
              <input
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="e.g. Digos River Irrigation System Rehabilitation, Padada Dam..."
                className="w-full text-xs rounded-lg border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
              />
            </div>

            {/* Activity Description */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Activity Description (What did you work on?) *
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of technical calculation, review, inspection or design conducted..."
                className="w-full text-xs rounded-lg border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
              />
            </div>

            {/* Specific Output */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Output / Tangible Accomplishment *
              </label>
              <textarea
                rows={2}
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                placeholder="Specific deliverable (e.g. 'Drafted 3 sheets structural CAD drawings', 'Prepared review endorsement memo')..."
                className="w-full text-xs rounded-lg border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white shadow-sm"
              />
            </div>

            {/* AI Assistant Banner */}
            <div className="md:col-span-3 p-3 rounded-lg bg-white border border-nia-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-nia-600" />
                <span className="text-xs text-slate-700">
                  <strong>AI Classifier (Phase 4):</strong> Ready to suggest IPCR Commitment code upon entry.
                </span>
              </div>
              <Badge variant="blue" size="sm">Advisory Only</Badge>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-200">
            <Button variant="secondary" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" size="sm">
              Save as Draft
            </Button>
            <Button variant="primary" size="sm">
              Save & Log Activity
            </Button>
          </div>
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
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border-slate-200 focus:border-nia-500 focus:ring-nia-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs rounded-lg border-slate-300 py-1.5 px-3 bg-white focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity List View */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {sampleActivities.map((act) => (
            <Card key={act.id} padding="md" className="hover:border-slate-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="blue" size="sm" className="font-mono">
                    {act.commitmentCode}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-800">{act.commitmentName}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">{act.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={act.status === 'COMPLETED' ? 'emerald' : 'blue'} size="sm" dot>
                    {act.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{act.timeSpent} hrs</span>
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

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {act.category}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate max-w-xs">
                    Project: {act.project}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    {act.supportingDocs} doc(s)
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100" title="Duplicate with new date">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100" title="Edit activity">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Calendar View Skeleton */
        <Card padding="md" className="text-center py-12">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">Calendar View Ready</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Visual calendar representation of dated daily activities and document release events.
          </p>
        </Card>
      )}
    </div>
  );
};
