import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Building2,
  FolderGit2,
  Clock,
  Target,
  Users,
  Compass,
  FileCheck2,
  CheckCircle2,
  Paperclip,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { AttachmentDropzone } from '@/components/common/AttachmentDropzone';
import { useApp } from '@/contexts/AppContext';
import {
  SHEET2_PROJECTS,
  SHEET2_OFFICE_SOURCES,
} from '@/data/sheet2MasterData';
import { TaskAttachment } from '@/types';

interface LogFieldWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  onSuccess?: () => void;
}

const FIELD_WORK_SCOPES = [
  'Field Validation & Investigation (POW FSDE)',
  'Site Inspection of Dam Axis / Intake Structure',
  'Main Canal Alignment & Right-of-Way (ROW) Validation',
  'Topographic & Alignment Ground Verification',
  'Joint Site Inspection with IMO & Irrigators Association (IA)',
  'Pre-FS / Feasibility Study Field Assessment',
  'SPIP (Solar-Powered Irrigation) Site Validation',
  'Post-Calamity / Damage Assessment Field Investigation',
  'Other Field Work',
];

export const LogFieldWorkModal: React.FC<LogFieldWorkModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  onSuccess,
}) => {
  const { addActivity, commitments } = useApp();

  const [date, setDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [selectedProject, setSelectedProject] = useState<string>('Suawan SRIP');
  const [isCustomProject, setIsCustomProject] = useState(false);
  const [customProjectInput, setCustomProjectInput] = useState('');
  const [fieldScope, setFieldScope] = useState<string>(FIELD_WORK_SCOPES[0]);
  const [targetCommitmentId, setTargetCommitmentId] = useState<string>(() => {
    // Default to SM7-POW if available
    const sm7pow = commitments.find(
      (c) => c.commitmentCode === 'SM7-POW' || c.id === 'com-sm7-pow'
    );
    return sm7pow ? sm7pow.id : commitments[0]?.id || '';
  });
  const [fieldWorkCount, setFieldWorkCount] = useState<number>(1);
  const [imoLocation, setImoLocation] = useState<string>('Regional Office XI');
  const [siteLocation, setSiteLocation] = useState<string>('');
  const [jointWith, setJointWith] = useState<string>('');
  const [findingsOutput, setFindingsOutput] = useState<string>('');
  const [timeSpentHours, setTimeSpentHours] = useState<string>('8.0');
  const [remarks, setRemarks] = useState<string>('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const resolvedProject =
      isCustomProject && customProjectInput.trim()
        ? customProjectInput.trim()
        : selectedProject;

    // Build descriptive title
    const description = `Field Work: ${fieldScope} for ${resolvedProject}${
      siteLocation ? ` at ${siteLocation}` : ''
    }. Joint inspection with ${jointWith || 'assigned engineering team'}.`;

    const output =
      findingsOutput.trim() ||
      `Conducted field validation and inspection of ${resolvedProject} (${fieldWorkCount} site visit/investigation) supplying SM7 Program of Works requirement.`;

    addActivity({
      activityDate: date,
      description,
      output,
      category: 'Field Inspection',
      project: resolvedProject,
      imoLocation,
      timeSpentHours: parseFloat(timeSpentHours) || 8.0,
      status: 'COMPLETED',
      commitmentId: targetCommitmentId,
      classificationStatus: 'CONFIRMED',
      remarks: remarks.trim() || `Field work counted toward SM7 POW accomplishment.`,
      isFieldWork: true,
      fieldWorkCount: Math.max(1, fieldWorkCount),
      fieldWorkType: fieldScope,
      siteLocation: siteLocation.trim() || undefined,
      jointWith: jointWith.trim() || undefined,
      attachments,
      supportingDocumentCount: attachments.length,
    });

    setIsSubmitting(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  const selectedCommitment = commitments.find((c) => c.id === targetCommitmentId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Compass className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Log Field Work (SM7 Submit Program of Works)
                <Badge variant="emerald" size="sm" className="bg-white/20 text-white border-white/30">
                  SM7 Goal Supply
                </Badge>
              </h2>
              <p className="text-xs text-emerald-100">
                Record on-site field validation, inspection, or survey verification contributing to SM7 POW
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

        {/* Informational Banner */}
        <div className="bg-emerald-50 px-6 py-2.5 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-900 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>SM7 POW Rule:</strong> Field investigations and site validations feed directly into the accomplishment of <strong>SM7. Submit Program of Work (FSDE)</strong>.
          </span>
        </div>

        {/* Form Body */}
        <form id="field-work-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Row 1: Date & Field Work Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Date of Field Work *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 bg-white shadow-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                  Field Work Unit Count *
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">Quantifiable Units</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={fieldWorkCount}
                  onChange={(e) => setFieldWorkCount(parseInt(e.target.value) || 1)}
                  className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 bg-white shadow-xs font-bold text-slate-800"
                />
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  site inspection{fieldWorkCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Target IPCR Goal Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                Target IPCR Goal (Supplied Commitment) *
              </span>
              <span className="text-[10px] text-slate-500">Defaults to SM7 POW</span>
            </label>
            <select
              value={targetCommitmentId}
              onChange={(e) => setTargetCommitmentId(e.target.value)}
              className="w-full text-xs rounded-xl border border-emerald-300 bg-emerald-50/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 font-bold text-emerald-900 shadow-xs"
            >
              {commitments.map((com) => (
                <option key={com.id} value={com.id}>
                  [{com.commitmentCode}] {com.mfoPap} (Target: {com.target})
                </option>
              ))}
            </select>
            {selectedCommitment && (
              <div className="mt-1 text-[11px] text-slate-500 italic">
                Indicator: {selectedCommitment.successIndicator.substring(0, 110)}...
              </div>
            )}
          </div>

          {/* Row 3: Project / Irrigation System & Office Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-emerald-600" />
                  Irrigation Project *
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
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 bg-white shadow-xs font-semibold text-slate-800"
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
                    className="w-full text-xs rounded-xl border border-emerald-400 bg-emerald-50/30 px-3.5 py-2 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Office / IMO Jurisdiction *
              </label>
              <select
                value={imoLocation}
                onChange={(e) => setImoLocation(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 bg-white shadow-xs font-semibold text-slate-800"
              >
                {SHEET2_OFFICE_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Field Work Scope */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              Field Work Scope / Investigation Type *
            </label>
            <select
              value={fieldScope}
              onChange={(e) => setFieldScope(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 bg-white shadow-xs font-medium text-slate-800"
            >
              {FIELD_WORK_SCOPES.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>

          {/* Row 5: Site Location & Joint Team */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Specific Site / Barangay / Stationing
              </label>
              <input
                type="text"
                placeholder="e.g. Brgy. Suawan, Axis Sta 0+450"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2 bg-white shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                Joint Team / Accompanied By
              </label>
              <input
                type="text"
                placeholder="e.g. Engr. Abbot, IMO Team, IA President"
                value={jointWith}
                onChange={(e) => setJointWith(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2 bg-white shadow-xs"
              />
            </div>
          </div>

          {/* Row 6: Tangible Findings / Highlights */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Field Findings & Tangible Highlights (Output Deliverable) *
            </label>
            <textarea
              required
              rows={3}
              value={findingsOutput}
              onChange={(e) => setFindingsOutput(e.target.value)}
              placeholder="e.g. Conducted on-site inspection and ground verification of proposed intake axis and canal alignment. Verified GPS coordinates, confirmed water source adequacy, and recorded geological surface conditions for CY 2027 POW preparation."
              className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 p-3 bg-white shadow-xs leading-relaxed"
            />
          </div>

          {/* Row 7: Hours & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Time Spent (Hours) *
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="24"
                required
                value={timeSpentHours}
                onChange={(e) => setTimeSpentHours(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2 bg-white shadow-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Remarks / Travel Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Special Order #2026-14; Itinerary of Travel"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2 bg-white shadow-xs"
              />
            </div>
          </div>

          {/* Field Photos & Evidences Vault */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                Field Inspection Photos & Evidences (Optional)
              </span>
              <span className="text-[11px] text-slate-500">Stored safely in local vault</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Attach geotagged site inspection photos, dam axis pictures, or signed field logs.
            </p>
            <AttachmentDropzone
              attachments={attachments}
              onChange={setAttachments}
              maxFiles={6}
            />
          </div>
        </form>

        {/* Sticky Action Footer (Always pinned in frame) */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supplying SM7 Submit Program of Works</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="md" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              form="field-work-form"
              disabled={isSubmitting}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {isSubmitting ? 'Saving Field Work...' : 'Save Field Work (Supply SM7)'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
