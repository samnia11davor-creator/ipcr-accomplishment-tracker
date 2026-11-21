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
  GraduationCap,
  Users2,
  Landmark,
  Sparkles,
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

export type TravelActivityType = 'field_work' | 'seminar' | 'workshop' | 'meeting';

interface LogFieldWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialType?: TravelActivityType;
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
  'Other Field Inspection',
];

const SEMINAR_SCOPES = [
  'PICE National / Regional Technical Conference',
  'Engineering CPD / Professional Development Seminar',
  'NIA In-House Technical / Leadership Training',
  'Structural & Hydraulic Modeling Software Training (HEC-RAS, Civil 3D, GIS)',
  'Procurement & Republic Act 9184 Seminar',
  'Occupational Safety and Health (COSH) Training',
  'Geotechnical / Hydrology Specialized Seminar',
  'Other Seminar / Capability Building',
];

const WORKSHOP_SCOPES = [
  'Pre-FS & DED Annual Planning Convergence',
  'Regional Project Preparation & Review Workshop',
  'Budget Preparation & Target Setting Workshop',
  'Water Resources Assessment & Allocation Workshop',
  'Joint Preliminary Data Gathering Workshop (WEFE Nexus / RISE)',
  'Irrigation Modernization & Sectoral Planning Workshop',
  'Other Planning Convergence Workshop',
];

const MEETING_SCOPES = [
  'Inter-Agency Coordination Meeting (DENR, NCIP, DPWH, LGUs, NEDA)',
  'Irrigators Association (IA) / Federation Consultative Meeting',
  'Project Coordination & Technical Working Group (TWG) Meeting',
  'Regional Development Council (RDC XI) Infrastructure Committee',
  'Central Office Virtual Coordination Conference',
  'Provincial / Municipal Stakeholders Consultation',
  'Other Coordination Meeting',
];

export const LogFieldWorkModal: React.FC<LogFieldWorkModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialType = 'field_work',
  onSuccess,
}) => {
  const { addActivity, commitments } = useApp();

  // Find standard commitments
  const sm7pow = useMemo(
    () => commitments.find((c) => c.commitmentCode === 'SM7-POW' || c.id === 'com-sm7-pow'),
    [commitments]
  );
  const cf2m9 = useMemo(
    () => commitments.find((c) => c.commitmentCode === 'CF2M9' || c.id === 'com-cf2m9'),
    [commitments]
  );

  // Activity / Mission Type
  const [travelType, setTravelType] = useState<TravelActivityType>(initialType);

  // Duration Mode: Single Day vs Multi-Day Event/Trip
  const [durationMode, setDurationMode] = useState<'single' | 'multi'>('single');
  const [date, setDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [startDate, setStartDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date(initialDate || new Date());
    d.setDate(d.getDate() + 2); // Default to a 3-day travel / seminar span
    return d.toISOString().split('T')[0];
  });
  const [multiDayCountRule, setMultiDayCountRule] = useState<'consolidated' | 'per_day'>('consolidated');
  const [excludeWeekends, setExcludeWeekends] = useState(false);

  // Project Association Flexibility
  const [hasSpecificProject, setHasSpecificProject] = useState<boolean>(initialType === 'field_work');
  const [selectedProject, setSelectedProject] = useState<string>('Suawan SRIP');
  const [isCustomProject, setIsCustomProject] = useState(false);
  const [customProjectInput, setCustomProjectInput] = useState('');

  // Target Commitment
  const [targetCommitmentId, setTargetCommitmentId] = useState<string>(() => {
    if (initialType === 'field_work') {
      return sm7pow ? sm7pow.id : commitments[0]?.id || '';
    }
    return cf2m9 ? cf2m9.id : commitments[0]?.id || '';
  });

  // Specific Sub-Scopes & Titles
  const [fieldScope, setFieldScope] = useState<string>(FIELD_WORK_SCOPES[0]);
  const [seminarScope, setSeminarScope] = useState<string>(SEMINAR_SCOPES[0]);
  const [workshopScope, setWorkshopScope] = useState<string>(WORKSHOP_SCOPES[0]);
  const [meetingScope, setMeetingScope] = useState<string>(MEETING_SCOPES[0]);

  // Dedicated Event Metadata
  const [eventTitle, setEventTitle] = useState<string>('');
  const [organizer, setOrganizer] = useState<string>('');
  const [venueLocation, setVenueLocation] = useState<string>('');
  const [imoLocation, setImoLocation] = useState<string>('Regional Office XI');
  const [siteLocation, setSiteLocation] = useState<string>('');
  const [jointWith, setJointWith] = useState<string>('');
  const [findingsOutput, setFindingsOutput] = useState<string>('');
  const [unitCount, setUnitCount] = useState<number>(1);
  const [timeSpentHours, setTimeSpentHours] = useState<string>('8.0');
  const [remarks, setRemarks] = useState<string>('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Switch travel type handler
  const handleTypeChange = (newType: TravelActivityType) => {
    setTravelType(newType);
    if (newType === 'field_work') {
      setHasSpecificProject(true);
      if (sm7pow) setTargetCommitmentId(sm7pow.id);
    } else {
      setHasSpecificProject(false);
      if (cf2m9) setTargetCommitmentId(cf2m9.id);
    }
  };

  // Compute list of dates for multi-day field work / seminars
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

  // Determine current category scope list
  const currentScopes =
    travelType === 'field_work'
      ? FIELD_WORK_SCOPES
      : travelType === 'seminar'
      ? SEMINAR_SCOPES
      : travelType === 'workshop'
      ? WORKSHOP_SCOPES
      : MEETING_SCOPES;

  const currentSelectedScope =
    travelType === 'field_work'
      ? fieldScope
      : travelType === 'seminar'
      ? seminarScope
      : travelType === 'workshop'
      ? workshopScope
      : meetingScope;

  const handleScopeChange = (val: string) => {
    if (travelType === 'field_work') setFieldScope(val);
    else if (travelType === 'seminar') setSeminarScope(val);
    else if (travelType === 'workshop') setWorkshopScope(val);
    else setMeetingScope(val);
  };

  // Resolve project name based on type and preference
  const resolvedProject = useMemo(() => {
    if (travelType === 'field_work') {
      return isCustomProject && customProjectInput.trim()
        ? customProjectInput.trim()
        : selectedProject;
    }

    if (hasSpecificProject) {
      return isCustomProject && customProjectInput.trim()
        ? customProjectInput.trim()
        : selectedProject;
    }

    // Generic defaults without forcing a specific irrigation project
    if (travelType === 'seminar') return 'Institutional / Capability Building';
    if (travelType === 'workshop') return 'Regional Planning & Design Convergence';
    if (travelType === 'meeting') return 'Inter-Agency Coordination';
    return 'Institutional / Regional Office XI';
  }, [travelType, hasSpecificProject, isCustomProject, customProjectInput, selectedProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const tripGroupId = durationMode === 'multi' ? `mission-${Date.now()}` : undefined;
    const totalDays = calculatedDates.length;

    calculatedDates.forEach((d, index) => {
      const dayNum = index + 1;

      // Construct descriptive log text based on category
      let dayDesc = '';
      let defaultOutputText = '';

      if (travelType === 'field_work') {
        dayDesc =
          durationMode === 'multi'
            ? `Field Work: ${fieldScope} for ${resolvedProject} (Day ${dayNum} of ${totalDays}, ${startDate} to ${endDate})${
                siteLocation ? ` at ${siteLocation}` : ''
              }. Joint inspection with ${jointWith || 'assigned engineering team'}.`
            : `Field Work: ${fieldScope} for ${resolvedProject}${
                siteLocation ? ` at ${siteLocation}` : ''
              }. Joint inspection with ${jointWith || 'assigned engineering team'}.`;

        defaultOutputText =
          durationMode === 'multi'
            ? findingsOutput.trim()
              ? `${findingsOutput.trim()} [Day ${dayNum} of ${totalDays}]`
              : `Conducted on-site field investigation and validation for ${resolvedProject} (Day ${dayNum} of ${totalDays}) supplying SM7 Program of Works requirement.`
            : findingsOutput.trim() ||
              `Conducted field validation and inspection of ${resolvedProject} (${unitCount} site visit/investigation) supplying SM7 Program of Works requirement.`;
      } else if (travelType === 'seminar') {
        const titleText = eventTitle.trim() || seminarScope;
        dayDesc =
          durationMode === 'multi'
            ? `Attended Seminar/Training: "${titleText}" conducted by ${organizer || 'Organizing Body'} at ${
                venueLocation || 'Designated Venue'
              } (Day ${dayNum} of ${totalDays}, ${startDate} to ${endDate}).`
            : `Attended Seminar/Training: "${titleText}" conducted by ${organizer || 'Organizing Body'} at ${
                venueLocation || 'Designated Venue'
              }.`;

        defaultOutputText =
          findingsOutput.trim() ||
          `Attended and completed technical seminar/training on "${titleText}" conducted by ${
            organizer || 'Organizing Body'
          } (${durationMode === 'multi' ? `${totalDays} days, ` : ''}supplying CF2M9).`;
      } else if (travelType === 'workshop') {
        const titleText = eventTitle.trim() || workshopScope;
        dayDesc =
          durationMode === 'multi'
            ? `Participated in Workshop: "${titleText}" hosted by ${organizer || 'EOD Planning & Design'} at ${
                venueLocation || 'Designated Venue'
              } (Day ${dayNum} of ${totalDays}, ${startDate} to ${endDate}).`
            : `Participated in Workshop: "${titleText}" hosted by ${organizer || 'EOD Planning & Design'} at ${
                venueLocation || 'Designated Venue'
              }.`;

        defaultOutputText =
          findingsOutput.trim() ||
          `Participated in convergence workshop: "${titleText}" hosted by ${
            organizer || 'EOD Planning & Design'
          } at ${venueLocation || 'Venue'} supplying CF2M9 requirements.`;
      } else {
        // Coordination Meeting
        const titleText = eventTitle.trim() || meetingScope;
        dayDesc =
          durationMode === 'multi'
            ? `Attended Coordination Meeting: "${titleText}" with ${jointWith || organizer || 'Stakeholders'} at ${
                venueLocation || 'Designated Venue'
              } (Day ${dayNum} of ${totalDays}).`
            : `Attended Coordination Meeting: "${titleText}" with ${jointWith || organizer || 'Stakeholders'} at ${
                venueLocation || 'Designated Venue'
              }.`;

        defaultOutputText =
          findingsOutput.trim() ||
          `Attended official coordination meeting on "${titleText}" with ${
            jointWith || organizer || 'stakeholders'
          } supplying CF2M9 coordination requirements.`;
      }

      // Unit count logic
      const unitCountForThisDay =
        durationMode === 'multi'
          ? multiDayCountRule === 'consolidated'
            ? index === 0
              ? Math.max(1, unitCount)
              : 0
            : Math.max(1, unitCount)
          : Math.max(1, unitCount);

      const activityCategory =
        travelType === 'field_work'
          ? 'Field Inspection'
          : travelType === 'meeting'
          ? 'Meetings and Coordination'
          : 'Meetings and Coordination';

      const customRemarks =
        remarks.trim() ||
        (travelType === 'field_work'
          ? durationMode === 'multi'
            ? `Field work travel mission (Day ${dayNum}/${totalDays}) counted toward SM7 POW.`
            : `Field work counted toward SM7 POW accomplishment.`
          : durationMode === 'multi'
          ? `${travelType.toUpperCase()} attendance (Day ${dayNum}/${totalDays}) counted toward CF2M9.`
          : `${travelType.toUpperCase()} attendance counted toward CF2M9.`);

      addActivity({
        activityDate: d,
        description: dayDesc,
        output: defaultOutputText,
        category: activityCategory,
        project: resolvedProject,
        imoLocation,
        timeSpentHours: parseFloat(timeSpentHours) || 8.0,
        status: 'COMPLETED',
        commitmentId: targetCommitmentId,
        classificationStatus: 'CONFIRMED',
        remarks: customRemarks,
        isFieldWork: true,
        travelType,
        eventTitle: eventTitle.trim() || undefined,
        organizer: organizer.trim() || undefined,
        venueLocation: venueLocation.trim() || undefined,
        fieldWorkCount: unitCountForThisDay,
        fieldWorkType: currentSelectedScope,
        siteLocation:
          travelType === 'field_work'
            ? siteLocation.trim() || undefined
            : venueLocation.trim() || undefined,
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
        {/* Dynamic Header based on Travel/Mission Type */}
        <div
          className={`px-6 py-4 text-white flex items-center justify-between shrink-0 transition-colors duration-200 ${
            travelType === 'field_work'
              ? 'bg-gradient-to-r from-emerald-800 to-teal-800'
              : travelType === 'seminar'
              ? 'bg-gradient-to-r from-indigo-800 to-blue-800'
              : travelType === 'workshop'
              ? 'bg-gradient-to-r from-violet-800 to-indigo-800'
              : 'bg-gradient-to-r from-teal-800 to-cyan-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              {travelType === 'field_work' && <Compass className="w-5 h-5 text-emerald-200" />}
              {travelType === 'seminar' && <GraduationCap className="w-5 h-5 text-indigo-200" />}
              {travelType === 'workshop' && <Users2 className="w-5 h-5 text-violet-200" />}
              {travelType === 'meeting' && <Landmark className="w-5 h-5 text-teal-200" />}
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                {travelType === 'field_work' && 'Log Field Work & Site Inspection'}
                {travelType === 'seminar' && 'Log Seminar & Capability Building'}
                {travelType === 'workshop' && 'Log Workshop & Planning Convergence'}
                {travelType === 'meeting' && 'Log Coordination Meeting & Conference'}
                <Badge variant="emerald" size="sm" className="bg-white/20 text-white border-white/30">
                  {travelType === 'field_work' ? 'SM7 Goal Supply' : 'CF2M9 Goal Supply'}
                </Badge>
              </h2>
              <p className="text-xs text-white/80">
                {travelType === 'field_work' && 'On-site dam axis, canal investigation, or validation supplying SM7 POW'}
                {travelType === 'seminar' && 'PICE conventions, CPD seminars, or NIA in-house technical training supplying CF2M9'}
                {travelType === 'workshop' && 'Pre-FS/DED planning convergence or regional workshops supplying CF2M9'}
                {travelType === 'meeting' && 'Inter-agency, LGU, or IA coordination meetings supplying CF2M9'}
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

        {/* Informational Guidance Banner */}
        <div
          className={`px-6 py-2.5 border-b flex items-center gap-2 text-xs shrink-0 ${
            travelType === 'field_work'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-900'
              : travelType === 'seminar'
              ? 'bg-indigo-50 border-indigo-100 text-indigo-900'
              : travelType === 'workshop'
              ? 'bg-violet-50 border-violet-100 text-violet-900'
              : 'bg-teal-50 border-teal-100 text-teal-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            {travelType === 'field_work' && (
              <>
                <strong>SM7 POW Rule:</strong> On-site investigations and field validations count directly towards{' '}
                <strong>SM7. Submit Program of Work (FSDE)</strong>.
              </>
            )}
            {travelType === 'seminar' && (
              <>
                <strong>CF2M9 Rule:</strong> Technical seminars and CPD trainings do not require a specific project and count towards{' '}
                <strong>CF2M9 (Meetings, Seminars & Workshops Attended)</strong>.
              </>
            )}
            {travelType === 'workshop' && (
              <>
                <strong>CF2M9 Rule:</strong> Planning convergences and regional workshops feed directly into{' '}
                <strong>CF2M9 (Strengthening Partnership & Convergence)</strong>.
              </>
            )}
            {travelType === 'meeting' && (
              <>
                <strong>CF2M9 Rule:</strong> Inter-agency, IA, and stakeholder coordination meetings feed directly into{' '}
                <strong>CF2M9 (Internal & External Coordination)</strong>.
              </>
            )}
          </span>
        </div>

        {/* Activity Category Tab Selector (4-Way Responsive Switcher) */}
        <div className="px-6 pt-4 pb-2 shrink-0 bg-slate-50 border-b border-slate-200">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center justify-between">
            <span>Activity & Travel Classification</span>
            <span className="text-[10px] text-slate-400 font-normal">Select travel or session type</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('field_work')}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                travelType === 'field_work'
                  ? 'bg-white text-emerald-950 shadow-xs border border-emerald-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">🌾 Field Work</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('seminar')}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                travelType === 'seminar'
                  ? 'bg-white text-indigo-950 shadow-xs border border-indigo-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">🎓 Seminar</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('workshop')}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                travelType === 'workshop'
                  ? 'bg-white text-violet-950 shadow-xs border border-violet-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users2 className="w-3.5 h-3.5 text-violet-600 shrink-0" />
              <span className="truncate">🤝 Workshop</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('meeting')}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                travelType === 'meeting'
                  ? 'bg-white text-teal-950 shadow-xs border border-teal-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">🏛️ Meeting</span>
            </button>
          </div>
        </div>

        {/* Duration Mode Segmented Buttons */}
        <div className="px-6 pt-3 pb-1 shrink-0">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
            Duration Format
          </label>
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setDurationMode('single')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                durationMode === 'single'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Single Day (1 Day Event)</span>
            </button>
            <button
              type="button"
              onClick={() => setDurationMode('multi')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                durationMode === 'multi'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Route className="w-3.5 h-3.5 text-slate-600" />
              <span>Multi-Day (2+ Days Span)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form id="travel-field-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Row 1: Date Configuration based on Mode */}
          {durationMode === 'single' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-nia-600" />
                  Date of Activity *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-nia-600" />
                    Quantifiable Accomplishment Unit *
                  </span>
                  <span className="text-[10px] text-nia-700 font-semibold">Official IPCR Count</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={unitCount}
                    onChange={(e) => setUnitCount(parseInt(e.target.value) || 1)}
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-xs font-bold text-slate-800"
                  />
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    {travelType === 'field_work'
                      ? `site visit${unitCount > 1 ? 's' : ''}`
                      : travelType === 'seminar'
                      ? `seminar${unitCount > 1 ? 's' : ''}`
                      : travelType === 'workshop'
                      ? `workshop${unitCount > 1 ? 's' : ''}`
                      : `meeting${unitCount > 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Multi-Day Travel / Seminar Range Configuration */
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-nia-600" />
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-nia-600" />
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Multi-day summary preview */}
              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-nia-700 text-white font-bold text-xs">
                    {calculatedDates.length} Days Span
                  </span>
                  <span className="text-slate-800 font-medium">
                    {startDate} to {endDate}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-700 font-semibold font-mono">
                    {(calculatedDates.length * (parseFloat(timeSpentHours) || 8.0)).toFixed(1)} total hours
                  </span>
                </div>

                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold text-xs">
                  <input
                    type="checkbox"
                    checked={excludeWeekends}
                    onChange={(e) => setExcludeWeekends(e.target.checked)}
                    className="rounded text-nia-600 focus:ring-nia-500"
                  />
                  <span>Exclude Weekends</span>
                </label>
              </div>

              {/* IPCR Accomplishment Supply Rule */}
              <div className="mt-2 pt-2 border-t border-slate-200">
                <span className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Accomplishment Counting Rule:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2 ${
                      multiDayCountRule === 'consolidated'
                        ? 'bg-white border-nia-500 shadow-2xs ring-1 ring-nia-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="multiDayRule"
                      checked={multiDayCountRule === 'consolidated'}
                      onChange={() => setMultiDayCountRule('consolidated')}
                      className="mt-0.5 text-nia-600 focus:ring-nia-500"
                    />
                    <div>
                      <strong className="text-slate-900 block">Consolidated ({unitCount} completed deliverable)</strong>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Logs all {calculatedDates.length} days on your calendar/DTR, but counts as 1 completed event/certificate for official IPCR ratings.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2 ${
                      multiDayCountRule === 'per_day'
                        ? 'bg-white border-nia-500 shadow-2xs ring-1 ring-nia-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="multiDayRule"
                      checked={multiDayCountRule === 'per_day'}
                      onChange={() => setMultiDayCountRule('per_day')}
                      className="mt-0.5 text-nia-600 focus:ring-nia-500"
                    />
                    <div>
                      <strong className="text-slate-900 block">Count Each Day ({calculatedDates.length} units)</strong>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Counts every individual attendance day as a distinct unit toward the target goal.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Row 2: Target IPCR Goal (Supplied Commitment) */}
          <CommitmentSelect
            label="Target IPCR Goal (Supplied Commitment) *"
            required
            value={targetCommitmentId}
            onChange={(id) => setTargetCommitmentId(id)}
            commitments={commitments}
            placeholder="Select target IPCR commitment..."
          />

          {/* Row 3: Sub-Scope / Specific Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-nia-600" />
                {travelType === 'field_work' && 'Field Investigation Scope *'}
                {travelType === 'seminar' && 'Seminar / Training Domain *'}
                {travelType === 'workshop' && 'Workshop & Convergence Type *'}
                {travelType === 'meeting' && 'Meeting / Agenda Classification *'}
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Pre-configured types</span>
            </label>
            <select
              value={currentSelectedScope}
              onChange={(e) => handleScopeChange(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-xs font-medium text-slate-800 truncate"
            >
              {currentScopes.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>

          {/* Row 4: Event Title / Agenda (For Seminars, Workshops, Meetings) */}
          {travelType !== 'field_work' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-nia-600" />
                {travelType === 'seminar' && 'Seminar / Course Title *'}
                {travelType === 'workshop' && 'Workshop Title / Theme *'}
                {travelType === 'meeting' && 'Meeting Agenda / Topic *'}
              </label>
              <input
                type="text"
                required
                placeholder={
                  travelType === 'seminar'
                    ? 'e.g. 50th PICE National Convention & Technical Conference'
                    : travelType === 'workshop'
                    ? 'e.g. CY 2027 Pre-FS & DED Annual Planning Convergence'
                    : 'e.g. Coordination Meeting on RISE Project Implementation with DENR and NCIP'
                }
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2.5 bg-white shadow-xs font-semibold text-slate-800"
              />
            </div>
          )}

          {/* Row 5: Project Selection (Flexible: Mandatory for Field Work, Optional for Seminar/Workshop/Meeting) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-nia-600" />
                <span>Irrigation Project Association</span>
              </label>

              {travelType !== 'field_work' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHasSpecificProject(false)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                      !hasSpecificProject
                        ? 'bg-nia-700 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    No Specific Project (General)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasSpecificProject(true)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                      hasSpecificProject
                        ? 'bg-nia-700 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Linked to Project
                  </button>
                </div>
              )}
            </div>

            {hasSpecificProject ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Select Project (Sheet2 Master) *
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
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2 bg-white shadow-xs font-semibold text-slate-800 truncate"
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
                        className="w-full text-xs rounded-xl border border-nia-400 bg-nia-50/30 px-3.5 py-1.5 focus:ring-2 focus:ring-nia-500/20"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    Office / IMO Jurisdiction *
                  </label>
                  <select
                    value={imoLocation}
                    onChange={(e) => setImoLocation(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2 bg-white shadow-xs font-semibold text-slate-800 truncate"
                  >
                    {SHEET2_OFFICE_SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic bg-white p-2.5 rounded-lg border border-slate-200/70">
                Logged under <strong>{resolvedProject}</strong>. Ideal for institutional capability building, PICE conferences, or division-wide convergence without locking to a single irrigation system.
              </p>
            )}
          </div>

          {/* Row 6: Location / Venue & Organizer / Joint Team */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {travelType === 'field_work'
                  ? 'Specific Dam Axis / River / Stationing'
                  : 'Venue / Platform / Hotel'}
              </label>
              <input
                type="text"
                placeholder={
                  travelType === 'field_work'
                    ? 'e.g. Brgy. Suawan, Axis Sta 0+450'
                    : 'e.g. Grand Menseng Hotel Davao / Zoom'
                }
                value={travelType === 'field_work' ? siteLocation : venueLocation}
                onChange={(e) => {
                  if (travelType === 'field_work') setSiteLocation(e.target.value);
                  else setVenueLocation(e.target.value);
                }}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2 bg-white shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                {travelType === 'field_work'
                  ? 'Joint Team / Accompanied By'
                  : travelType === 'seminar'
                  ? 'Organizer / Accredited Provider'
                  : travelType === 'workshop'
                  ? 'Host Division / Agency'
                  : 'Stakeholders / Attendees'}
              </label>
              <input
                type="text"
                placeholder={
                  travelType === 'field_work'
                    ? 'e.g. IMO Engineers, IA Officers'
                    : travelType === 'seminar'
                    ? 'e.g. Philippine Institute of Civil Engineers (PICE)'
                    : travelType === 'workshop'
                    ? 'e.g. NIA Region XI - EOD Planning and Design'
                    : 'e.g. DENR, NCIP, LGU Representatives'
                }
                value={travelType === 'field_work' ? jointWith : organizer}
                onChange={(e) => {
                  if (travelType === 'field_work') setJointWith(e.target.value);
                  else setOrganizer(e.target.value);
                }}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2 bg-white shadow-xs"
              />
            </div>
          </div>

          {/* Row 7: Deliverable Output & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Output Deliverable / Findings</span>
                <span className="text-[10px] text-slate-400 font-normal">Auto-generates if empty</span>
              </label>
              <input
                type="text"
                placeholder={
                  travelType === 'field_work'
                    ? 'e.g. Completed site validation of proposed dam axis, verified stationing and bedrock...'
                    : travelType === 'seminar'
                    ? 'e.g. Completed 16 hours of technical engineering training, earned CPD units...'
                    : travelType === 'workshop'
                    ? 'e.g. Participated in planning convergence, finalized project prioritization matrix...'
                    : 'e.g. Formulated inter-agency resolution for watershed and irrigation protection...'
                }
                value={findingsOutput}
                onChange={(e) => setFindingsOutput(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2 bg-white shadow-xs font-medium"
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
                className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2 bg-white shadow-xs font-semibold"
              />
            </div>
          </div>

          {/* Row 8: Remarks / Travel Order Ref */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Remarks / Special Order / Travel Order Ref (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Per Travel Order No. 2026-112; Special Order No. 2026-045"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 focus:border-nia-500 focus:ring-2 focus:ring-nia-500/20 px-3.5 py-2 bg-white shadow-xs"
            />
          </div>

          {/* Evidences & Supporting Documents Dropzone */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-nia-600" />
                {travelType === 'field_work'
                  ? 'Field Inspection Photos & Evidences (Optional)'
                  : 'Certificates of Attendance, Special Order, or Program (Optional)'}
              </span>
              <span className="text-[11px] text-slate-500">Stored safely in local vault</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {travelType === 'field_work'
                ? 'Attach geotagged site inspection photos, dam axis pictures, or signed field logs.'
                : 'Attach Certificate of Attendance / Completion, Travel Order, Photos, or Minutes of Meeting.'}
            </p>
            <AttachmentDropzone
              attachments={attachments}
              onChange={setAttachments}
              maxFiles={6}
            />
          </div>
        </form>

        {/* Sticky Action Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs font-semibold flex items-center gap-1.5 text-slate-700">
            {travelType === 'field_work' && <Compass className="w-3.5 h-3.5 text-emerald-600" />}
            {travelType === 'seminar' && <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />}
            {travelType === 'workshop' && <Users2 className="w-3.5 h-3.5 text-violet-600" />}
            {travelType === 'meeting' && <Landmark className="w-3.5 h-3.5 text-teal-600" />}
            <span>
              {durationMode === 'multi'
                ? `Logging ${calculatedDates.length} Days to ${
                    travelType === 'field_work' ? 'SM7 POW' : 'CF2M9'
                  }`
                : `Supplying ${travelType === 'field_work' ? 'SM7 POW' : 'CF2M9'}`}
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
              form="travel-field-form"
              disabled={isSubmitting}
              className={`${
                travelType === 'field_work'
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : travelType === 'seminar'
                  ? 'bg-indigo-700 hover:bg-indigo-800'
                  : travelType === 'workshop'
                  ? 'bg-violet-700 hover:bg-violet-800'
                  : 'bg-teal-700 hover:bg-teal-800'
              } text-white font-semibold`}
            >
              {isSubmitting
                ? 'Saving Log...'
                : durationMode === 'multi'
                ? `Save ${calculatedDates.length}-Day ${
                    travelType === 'field_work' ? 'Field Work' : 'Event'
                  }`
                : `Save ${
                    travelType === 'field_work'
                      ? 'Field Work'
                      : travelType === 'seminar'
                      ? 'Seminar Log'
                      : travelType === 'workshop'
                      ? 'Workshop Log'
                      : 'Meeting Log'
                  }`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
