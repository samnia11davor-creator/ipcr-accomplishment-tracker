import React, { useState, useMemo } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Building2,
  FolderGit2,
  Clock,
  Users,
  Compass,
  FileCheck2,
  CheckCircle2,
  Paperclip,
  Route,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { AttachmentDropzone } from '@/components/common/AttachmentDropzone';
import { CommitmentSelect } from '@/components/common/CommitmentSelect';
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

  // Mode: Single Day vs Multi-Day Trip
  const [durationMode, setDurationMode] = useState<'single' | 'multi'>('single');
  const [date, setDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [startDate, setStartDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date(initialDate || new Date());
    d.setDate(d.getDate() + 2); // Default to a 3-day travel span
    return d.toISOString().split('T')[0];
  });
  const [multiDayCountRule, setMultiDayCountRule] = useState<'consolidated' | 'per_day'>('consolidated');
  const [excludeWeekends, setExcludeWeekends] = useState(false);

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

  // Compute list of dates for multi-day field work
  const calculatedDates = useMemo(() => {
    if (durationMode === 'single') {
      return [date];
    }
    if (!startDate || !endDate) return [startDate || date];
    const s = new Date(startDate + 'T00:00:00');
    const e = new Date(endDate + 'T00:00:00');
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) return [startDate];

    const result: string[] = [];
    const cur = new Date(s);
    while (cur <= e) {
      const dayOfWeek = cur.getDay(); // 0 = Sun, 6 = Sat
      if (!excludeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
        result.push(cur.toISOString().split('T')[0]);
      }
      cur.setDate(cur.getDate() + 1);
    }
    return result.length > 0 ? result : [startDate];
  }, [durationMode, date, startDate, endDate, excludeWeekends]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const resolvedProject =
      isCustomProject && customProjectInput.trim()
        ? customProjectInput.trim()
        : selectedProject;

    const tripGroupId = durationMode === 'multi' ? `trip-${Date.now()}` : undefined;
    const totalDays = calculatedDates.length;

    calculatedDates.forEach((d, index) => {
      const dayNum = index + 1;
      const dayDesc =
        durationMode === 'multi'
          ? `Field Work: ${fieldScope} for ${resolvedProject} (Day ${dayNum} of ${totalDays}, ${startDate} to ${endDate})${
              siteLocation ? ` at ${siteLocation}` : ''
            }. Joint inspection with ${jointWith || 'assigned engineering team'}.`
          : `Field Work: ${fieldScope} for ${resolvedProject}${
              siteLocation ? ` at ${siteLocation}` : ''
            }. Joint inspection with ${jointWith || 'assigned engineering team'}.`;

      const dayOutput =
        durationMode === 'multi'
          ? findingsOutput.trim()
            ? `${findingsOutput.trim()} [Day ${dayNum} of ${totalDays}]`
            : `Conducted on-site field investigation and validation for ${resolvedProject} (Day ${dayNum} of ${totalDays}) supplying SM7 Program of Works requirement.`
          : findingsOutput.trim() ||
            `Conducted field validation and inspection of ${resolvedProject} (${fieldWorkCount} site visit/investigation) supplying SM7 Program of Works requirement.`;

      // Unit count logic for SM7
      const unitCountForThisDay =
        durationMode === 'multi'
          ? multiDayCountRule === 'consolidated'
            ? index === 0
              ? Math.max(1, fieldWorkCount)
              : 0
            : Math.max(1, fieldWorkCount)
          : Math.max(1, fieldWorkCount);

      addActivity({
        activityDate: d,
        description: dayDesc,
        output: dayOutput,
        category: 'Field Inspection',
        project: resolvedProject,
        imoLocation,
        timeSpentHours: parseFloat(timeSpentHours) || 8.0,
        status: 'COMPLETED',
        commitmentId: targetCommitmentId,
        classificationStatus: 'CONFIRMED',
        remarks:
          remarks.trim() ||
          (durationMode === 'multi'
            ? `Field work travel mission (Day ${dayNum}/${totalDays}) counted toward SM7 POW.`
            : `Field work counted toward SM7 POW accomplishment.`),
        isFieldWork: true,
        fieldWorkCount: unitCountForThisDay,
        fieldWorkType: fieldScope,
        siteLocation: siteLocation.trim() || undefined,
        jointWith: jointWith.trim() || undefined,
        attachments,
        supportingDocumentCount: attachments.length,
        startDate: durationMode === 'multi' ? startDate : undefined,
        endDate: durationMode === 'multi' ? endDate : undefined,
        durationDays: durationMode === 'multi' ? totalDays : 1,
        tripDayIndex: durationMode === 'multi' ? dayNum : 1,
        tripGroupId,
      });
    });

    setIsSubmitting(false);
    if (onSuccess) onSuccess();
    onClose();
  };

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
                Record on-site field validation, inspection, or multi-day travel contributing to SM7 POW
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

        {/* Duration Mode Segmented Buttons */}
        <div className="px-6 pt-4 pb-1 shrink-0">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
            Field Work Duration Type
          </label>
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setDurationMode('single')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                durationMode === 'single'
                  ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Single Day (1 Day Trip)</span>
            </button>
            <button
              type="button"
              onClick={() => setDurationMode('multi')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                durationMode === 'multi'
                  ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Route className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Day Field Work (2+ Days)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form id="field-work-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Row 1: Date Configuration based on Mode */}
          {durationMode === 'single' ? (
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
                    site visit{fieldWorkCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Multi-Day Travel Range Configuration */
            <div className="space-y-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Travel Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 bg-white shadow-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Travel End Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 bg-white shadow-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Multi-day summary preview */}
              <div className="pt-2 border-t border-emerald-200/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-xs">
                    {calculatedDates.length} Days Travel
                  </span>
                  <span className="text-emerald-950 font-medium">
                    {startDate} to {endDate}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-emerald-800 font-semibold font-mono">
                    {(calculatedDates.length * (parseFloat(timeSpentHours) || 8.0)).toFixed(1)} total hours
                  </span>
                </div>

                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold text-xs">
                  <input
                    type="checkbox"
                    checked={excludeWeekends}
                    onChange={(e) => setExcludeWeekends(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Exclude Weekends</span>
                </label>
              </div>

              {/* SM7 Accomplishment Supply Rule */}
              <div className="mt-2 pt-2 border-t border-emerald-200/70">
                <span className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  SM7 Program of Works Count Rule:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2 ${
                    multiDayCountRule === 'consolidated'
                      ? 'bg-white border-emerald-500 shadow-2xs ring-1 ring-emerald-500/20'
                      : 'bg-emerald-50/50 border-emerald-200 hover:bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="multiDayRule"
                      checked={multiDayCountRule === 'consolidated'}
                      onChange={() => setMultiDayCountRule('consolidated')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <strong className="text-emerald-950 block">Consolidated Mission (1 POW output)</strong>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Logs all {calculatedDates.length} days for your daily DTR, but counts as 1 completed site investigation toward SM7 POW.
                      </span>
                    </div>
                  </label>

                  <label className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2 ${
                    multiDayCountRule === 'per_day'
                      ? 'bg-white border-emerald-500 shadow-2xs ring-1 ring-emerald-500/20'
                      : 'bg-emerald-50/50 border-emerald-200 hover:bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="multiDayRule"
                      checked={multiDayCountRule === 'per_day'}
                      onChange={() => setMultiDayCountRule('per_day')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <strong className="text-emerald-950 block">Count Each Day ({calculatedDates.length} site visits)</strong>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Counts every travel day as a distinct site investigation toward SM7 POW.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Row 2: Target IPCR Goal (Custom Contained Selector) */}
          <CommitmentSelect
            label="Target IPCR Goal (Supplied Commitment)"
            required
            value={targetCommitmentId}
            onChange={(id) => setTargetCommitmentId(id)}
            commitments={commitments}
            placeholder="Select target IPCR commitment (defaults to SM7 POW)..."
          />

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
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 bg-white shadow-xs font-semibold text-slate-800 truncate"
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
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 bg-white shadow-xs font-semibold text-slate-800 truncate"
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
              className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 bg-white shadow-xs font-medium text-slate-800 truncate"
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
                placeholder="e.g. IMO Engineers, IA Officers, LGU staff"
                value={jointWith}
                onChange={(e) => setJointWith(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2 bg-white shadow-xs"
              />
            </div>
          </div>

          {/* Row 6: Deliverable / Findings & Time Spent */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Field Findings / Output Deliverable (Counted for SM7)
              </label>
              <input
                type="text"
                placeholder="e.g. Completed site validation of proposed dam axis, verified stationing and bedrock..."
                value={findingsOutput}
                onChange={(e) => setFindingsOutput(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2 bg-white shadow-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Hours {durationMode === 'multi' ? 'per Day' : 'Spent'} *
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
          </div>

          {/* Row 7: Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Remarks / Travel Order Ref (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Per Travel Order No. 2026-089; Joint inspection with Regional Planning team"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2 bg-white shadow-xs"
            />
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
            <span>
              {durationMode === 'multi'
                ? `Logging ${calculatedDates.length} Days Travel to SM7 POW`
                : 'Supplying SM7 Submit Program of Works'}
            </span>
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
              {isSubmitting
                ? 'Saving Field Work...'
                : durationMode === 'multi'
                ? `Save ${calculatedDates.length}-Day Field Work (Supply SM7)`
                : 'Save Field Work (Supply SM7)'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
