import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Building2,
  FolderGit2,
  Layers,
  Clock,
  Target,
  FileText,
  CheckCircle2,
  Paperclip,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { AttachmentDropzone } from '@/components/common/AttachmentDropzone';
import { useApp } from '@/contexts/AppContext';
import { getDtrForDate } from '@/lib/dtrParser';
import {
  SHEET2_PROJECTS,
  SHEET2_DOC_TYPES,
  SHEET2_OFFICE_SOURCES,
} from '@/data/sheet2MasterData';
import { ActivityStatus, TaskAttachment } from '@/types';
import { getCurrentManilaDateString } from '@/lib/dates';

interface LogDailyTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  onSuccess?: () => void;
}

export const LogDailyTaskModal: React.FC<LogDailyTaskModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  onSuccess,
}) => {
  const { addActivity, commitments } = useApp();

  const [activityDate, setActivityDate] = useState<string>(
    initialDate || getCurrentManilaDateString()
  );
  const [description, setDescription] = useState<string>('');
  const [output, setOutput] = useState<string>('');

  // Project state
  const [selectedProject, setSelectedProject] = useState<string>('Suawan SRIP');
  const [isCustomProject, setIsCustomProject] = useState(false);
  const [customProjectInput, setCustomProjectInput] = useState('');

  // Category / Doc Type state
  const [selectedCategory, setSelectedCategory] = useState<string>('Detailed Engineering');
  const [isCustomDocType, setIsCustomDocType] = useState(false);
  const [customDocTypeInput, setCustomDocTypeInput] = useState('');

  // Office / Origin state
  const [imoLocation, setImoLocation] = useState<string>('Regional Office XI');
  const [outsideSender, setOutsideSender] = useState<string>('');
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [timeSpent, setTimeSpent] = useState<string>('4.0');
  const [status, setStatus] = useState<ActivityStatus>('COMPLETED');
  const [commitmentId, setCommitmentId] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dtrInfo = getDtrForDate(activityDate);

  // Update date if initialDate changes
  useEffect(() => {
    if (initialDate) {
      setActivityDate(initialDate);
    }
  }, [initialDate]);

  // Set default commitment if available
  useEffect(() => {
    if (commitments.length > 0 && !commitmentId) {
      setCommitmentId(commitments[0].id);
    }
  }, [commitments, commitmentId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const resolvedProject =
      isCustomProject && customProjectInput.trim()
        ? customProjectInput.trim()
        : selectedProject;

    const resolvedCategory =
      isCustomDocType && customDocTypeInput.trim()
        ? customDocTypeInput.trim()
        : selectedCategory;

    const resolvedLocation =
      imoLocation === 'Others (Outside)' && outsideSender.trim()
        ? `Others (${outsideSender.trim()})`
        : imoLocation;

    addActivity({
      activityDate,
      description: description.trim(),
      output: output.trim(),
      category: resolvedCategory,
      project: resolvedProject,
      imoLocation: resolvedLocation,
      calendarYear: Number(calendarYear) || 2026,
      timeSpentHours: parseFloat(timeSpent) || 4.0,
      status,
      commitmentId: commitmentId || undefined,
      classificationStatus: commitmentId ? 'CONFIRMED' : 'PENDING',
      remarks: remarks.trim() || undefined,
      attachments,
      supportingDocumentCount: attachments.length,
      isFieldWork: false,
    });

    setIsSubmitting(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  const selectedCommitment = commitments.find((c) => c.id === commitmentId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-nia-900 via-nia-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Log Work / Document Task
                <Badge variant="blue" size="sm" className="bg-white/20 text-white border-white/30">
                  Calendar Entry
                </Badge>
              </h2>
              <p className="text-xs text-slate-300">
                Record quantifiable engineering outputs, review memorandums, or drawings on the calendar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Row 1: Date & Office Origin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-nia-600" />
                Work Date *
              </label>
              <input
                type="date"
                required
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-xs font-semibold text-slate-800"
              />
              {dtrInfo && (
                <button
                  type="button"
                  onClick={() => setTimeSpent(String(dtrInfo.totalHours))}
                  className="mt-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg flex items-center justify-between w-full transition-colors"
                  title="Click to apply official DTR hours"
                >
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>DTR: {dtrInfo.timeIn} - {dtrInfo.timeOut}</span>
                  </span>
                  <span className="underline font-bold text-emerald-900">Set {dtrInfo.totalHours} hrs</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-nia-600" />
                Office Origin / Source *
              </label>
              <select
                value={imoLocation}
                onChange={(e) => setImoLocation(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-xs font-semibold text-slate-800"
              >
                {SHEET2_OFFICE_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* External sender input if Others is selected */}
          {imoLocation === 'Others (Outside)' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specify External Sender / Agency *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DPWH Region XI, LGU Davao, Contractor..."
                value={outsideSender}
                onChange={(e) => setOutsideSender(e.target.value)}
                className="w-full text-xs rounded-xl border border-amber-300 bg-amber-50/30 px-3.5 py-2 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          )}

          {/* Row 2: Related Project & Doc Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-nia-600" />
                  Related Project *
                </span>
                <span className="text-[10px] text-nia-700 font-semibold">Sheet2 Master</span>
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
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-xs font-semibold text-slate-800"
              >
                <optgroup label="Official Sheet2 Irrigation Projects">
                  {SHEET2_PROJECTS.map((proj) => (
                    <option key={proj} value={proj}>
                      {proj}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Custom Option">
                  <option value="__ADD_NEW__">+ Enter Other Project...</option>
                </optgroup>
              </select>

              {isCustomProject && (
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    placeholder="Type unlisted project name..."
                    value={customProjectInput}
                    onChange={(e) => setCustomProjectInput(e.target.value)}
                    className="w-full text-xs rounded-xl border border-nia-400 bg-nia-50/30 px-3.5 py-2 focus:ring-2 focus:ring-nia-500/20"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-nia-600" />
                  Category / Doc Type *
                </span>
                <span className="text-[10px] text-nia-700 font-semibold">Sheet2 Catalog</span>
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
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-xs font-semibold text-slate-800"
              >
                <optgroup label="Official Sheet2 Document Types">
                  {SHEET2_DOC_TYPES.map((dt) => (
                    <option key={dt} value={dt}>
                      {dt}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Custom Option">
                  <option value="__ADD_NEW__">+ Enter Other Type...</option>
                </optgroup>
              </select>

              {isCustomDocType && (
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    placeholder="Type custom doc type..."
                    value={customDocTypeInput}
                    onChange={(e) => setCustomDocTypeInput(e.target.value)}
                    className="w-full text-xs rounded-xl border border-nia-400 bg-nia-50/30 px-3.5 py-2 focus:ring-2 focus:ring-nia-500/20"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Target IPCR Goal (Commitment) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-nia-600" />
                Supplied IPCR Commitment (Goal) *
              </span>
              <span className="text-[10px] text-slate-500">Auto-links to IPCR rating</span>
            </label>
            <select
              value={commitmentId}
              onChange={(e) => setCommitmentId(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-xs font-bold text-slate-800"
            >
              {commitments.map((com) => (
                <option key={com.id} value={com.id}>
                  [{com.commitmentCode}] {com.mfoPap} (Target: {com.target})
                </option>
              ))}
            </select>
            {selectedCommitment && (
              <div className="mt-1 text-[11px] text-slate-500 italic truncate">
                Indicator: {selectedCommitment.successIndicator}
              </div>
            )}
          </div>

          {/* Row 4: Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Activity Description *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Prepared detailed engineering drawings, cross-sections, and profile plans for main canal..."
              className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 p-3 bg-white shadow-xs leading-relaxed"
            />
          </div>

          {/* Row 5: Tangible Output Deliverable */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tangible Output Deliverable (Counted for IPCR) *
            </label>
            <textarea
              required
              rows={2}
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              placeholder="e.g. 1 Completed set of DED Drawings (6 sheets) and technical review memorandum..."
              className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 p-3 bg-white shadow-xs leading-relaxed font-medium"
            />
          </div>

          {/* Row 6: Hours, Status & CY */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Hours Spent *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                required
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2 bg-white shadow-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2 bg-white shadow-xs font-semibold"
              >
                <option value="COMPLETED">COMPLETED</option>
                <option value="ONGOING">ONGOING</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Calendar Year (CY)
              </label>
              <input
                type="number"
                value={calendarYear}
                onChange={(e) => setCalendarYear(parseInt(e.target.value) || 2026)}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2 bg-white shadow-xs font-mono"
              />
            </div>
          </div>

          {/* Row 7: Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Remarks / Reference Code (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Official memo ref #RO-2026-112; emailed to Division Manager"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2 bg-white shadow-xs"
            />
          </div>

          {/* Attachments Vault */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-nia-600" />
                Supporting Evidences & Files (Photos, PDFs, Word, Excel)
              </span>
              <span className="text-[11px] text-slate-500">Stored safely in local vault</span>
            </div>
            <AttachmentDropzone
              attachments={attachments}
              onChange={setAttachments}
              maxFiles={6}
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 shrink-0">
            <Button variant="secondary" size="md" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Task...' : 'Save Task to Calendar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
