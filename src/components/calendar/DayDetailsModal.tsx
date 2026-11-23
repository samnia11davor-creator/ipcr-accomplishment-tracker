import React from 'react';
import {
  X,
  Calendar,
  Compass,
  FileText,
  Clock,
  MapPin,
  Users,
  Paperclip,
  Trash2,
  Plus,
  Building2,
  FolderGit2,
  ShieldCheck,
  GraduationCap,
  Users2,
  Landmark,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { DailyActivity, TaskAttachment } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { getDtrForDate } from '@/lib/dtrParser';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  activities: DailyActivity[];
  onOpenFieldWorkModal: (date: string, type?: 'field_work' | 'seminar' | 'workshop' | 'meeting') => void;
  onOpenActivityModal: (date: string) => void;
  onViewAttachment: (att: TaskAttachment) => void;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  activities,
  onOpenFieldWorkModal,
  onOpenActivityModal,
  onViewAttachment,
}) => {
  const { deleteActivity, commitments } = useApp();

  if (!isOpen) return null;

  const dayActivities = activities.filter(
    (a) => a.activityDate === dateStr && !a.isDeleted
  );

  const fieldWorks = dayActivities.filter((a) => a.isFieldWork);
  const docTasks = dayActivities.filter((a) => !a.isFieldWork);
  const totalHours = dayActivities.reduce((acc, a) => acc + (a.timeSpentHours || 0), 0);
  const fieldWorkUnits = fieldWorks.reduce((acc, a) => acc + (a.fieldWorkCount || 1), 0);
  const dtrInfo = getDtrForDate(dateStr);

  // Format date nicely
  const parsedDate = new Date(`${dateStr}T12:00:00`);
  const formattedDate = parsedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-nia-700 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">{formattedDate}</h3>
              <p className="text-xs text-slate-400 font-mono">{dateStr}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Day Metric Summary Pill Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              {dayActivities.length} Total Task{dayActivities.length === 1 ? '' : 's'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-700 font-semibold">{docTasks.length} Document Logs</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold">
              {fieldWorks.length} Field / Seminar / Travel{fieldWorks.length === 1 ? '' : 's'} ({fieldWorkUnits} unit{fieldWorkUnits === 1 ? '' : 's'})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{totalHours.toFixed(1)} hrs total</span>
          </div>
        </div>

        {/* Biometric Guard House DTR Card */}
        {dtrInfo && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-emerald-900 block">
                  Official Biometric Record ({dtrInfo.primaryMachine})
                </span>
                <span className="text-[11px] text-emerald-800">
                  Time In: <strong>{dtrInfo.timeIn || '—'}</strong> &nbsp;•&nbsp; Time Out: <strong>{dtrInfo.timeOut || '—'}</strong>
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Credited Hours</span>
              <span className="font-mono font-bold text-emerald-900 text-sm">{dtrInfo.totalHours.toFixed(1)} hrs</span>
            </div>
          </div>
        )}

        {/* Content List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {dayActivities.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-nia-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No work logged for this date</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Click below to add a quantifiable document task (drawings, review memos, reports) or log on-site field validation for SM7 POW.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    onClose();
                    onOpenActivityModal(dateStr);
                  }}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  + Log Document Task
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    onClose();
                    onOpenFieldWorkModal(dateStr, 'field_work');
                  }}
                  leftIcon={<Compass className="w-4 h-4 text-emerald-700" />}
                  className="border-emerald-300 text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100 font-semibold"
                >
                  + Field Work (SM7)
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    onClose();
                    onOpenFieldWorkModal(dateStr, 'seminar');
                  }}
                  leftIcon={<GraduationCap className="w-4 h-4 text-indigo-700" />}
                  className="border-indigo-300 text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100 font-semibold"
                >
                  + Seminar & Workshop (CF2M9)
                </Button>
              </div>
            </div>
          ) : (
            dayActivities.map((act) => {
              const matchedCommitment = commitments.find((c) => c.id === act.commitmentId);
              const isFw = act.isFieldWork;
              const isSeminar = act.travelType === 'seminar';
              const isWorkshop = act.travelType === 'workshop';
              const isMeeting = act.travelType === 'meeting';

              const cardBorder = isSeminar
                ? 'bg-indigo-50/40 border-indigo-200 shadow-xs'
                : isWorkshop
                ? 'bg-violet-50/40 border-violet-200 shadow-xs'
                : isMeeting
                ? 'bg-teal-50/40 border-teal-200 shadow-xs'
                : isFw
                ? 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                : 'bg-white border-slate-200 shadow-xs';

              return (
                <div
                  key={act.id}
                  className={`p-4 rounded-xl border transition-all ${cardBorder}`}
                >
                  {/* Card Top Row: Type & Hours */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-2.5">
                    <div className="flex items-center gap-2">
                      {isFw ? (
                        isSeminar ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-indigo-700" />
                            Seminar / Training (CF2M9)
                            {act.durationDays && act.durationDays > 1
                              ? ` • Day ${act.tripDayIndex || 1} of ${act.durationDays}`
                              : ''}
                          </span>
                        ) : isWorkshop ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 text-violet-900 border border-violet-300 flex items-center gap-1">
                            <Users2 className="w-3 h-3 text-violet-700" />
                            Workshop / Convergence (CF2M9)
                            {act.durationDays && act.durationDays > 1
                              ? ` • Day ${act.tripDayIndex || 1} of ${act.durationDays}`
                              : ''}
                          </span>
                        ) : isMeeting ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-300 flex items-center gap-1">
                            <Landmark className="w-3 h-3 text-teal-700" />
                            Coordination Meeting (CF2M9)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Compass className="w-3 h-3 text-emerald-700" />
                            Field Work (SM7 POW)
                            {act.durationDays && act.durationDays > 1
                              ? ` • Day ${act.tripDayIndex || 1} of ${act.durationDays} (${act.startDate} - ${act.endDate})`
                              : ` • ${act.fieldWorkCount || 1} site`}
                          </span>
                        )
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-blue-600" />
                          {act.category || 'Document Log'}
                        </span>
                      )}

                      <Badge
                        variant={act.status === 'COMPLETED' ? 'emerald' : 'blue'}
                        size="sm"
                      >
                        {act.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-600 font-mono">
                        {act.timeSpentHours || 4.0} hrs
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('Delete this logged activity?')) {
                            deleteActivity(act.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Project & Jurisdiction */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mb-2">
                    {act.eventTitle && (
                      <div className="w-full text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-0.5">
                        <span className="text-nia-700">★</span>
                        <span>{act.eventTitle}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 font-semibold text-slate-800">
                      <FolderGit2 className="w-3.5 h-3.5 text-nia-600" />
                      <span>{act.project || 'General Project'}</span>
                    </div>
                    {act.imoLocation && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{act.imoLocation}</span>
                      </div>
                    )}
                    {act.siteLocation && (
                      <div className="flex items-center gap-1 text-emerald-700 font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{act.siteLocation}</span>
                      </div>
                    )}
                    {act.organizer && (
                      <div className="flex items-center gap-1 text-indigo-700 font-medium">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Host: {act.organizer}</span>
                      </div>
                    )}
                    {act.jointWith && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Users className="w-3.5 h-3.5" />
                        <span>Joint: {act.jointWith}</span>
                      </div>
                    )}
                  </div>

                  {/* Description & Deliverable */}
                  <p className="text-xs text-slate-800 font-medium leading-relaxed mb-1.5">
                    {act.description}
                  </p>
                  <div className="text-xs text-slate-600 bg-slate-100/70 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                    <strong className="text-slate-700">Tangible Output: </strong>
                    {act.output}
                  </div>

                  {/* Supplied Goal Badge */}
                  {matchedCommitment && (
                    <div className="mt-2 text-[11px] text-nia-800 flex items-center gap-1 font-medium">
                      <span className="font-bold">Supplies Goal:</span>
                      <span className="px-1.5 py-0.5 rounded bg-nia-100 font-mono text-[10px] font-bold">
                        {matchedCommitment.commitmentCode}
                      </span>
                      <span className="truncate">{matchedCommitment.mfoPap}</span>
                    </div>
                  )}

                  {/* Attachments Preview */}
                  {act.attachments && act.attachments.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200/80">
                      <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <Paperclip className="w-3 h-3 text-slate-500" />
                        <span>Evidences & Photos ({act.attachments.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {act.attachments.map((att) => (
                          <button
                            key={att.id}
                            type="button"
                            onClick={() => onViewAttachment(att)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white border border-slate-200 hover:border-nia-500 hover:bg-nia-50/50 shadow-2xs transition-all group"
                          >
                            {att.fileType.startsWith('image/') && att.thumbnailUrl ? (
                              <img
                                src={att.thumbnailUrl}
                                alt={att.fileName}
                                className="w-4 h-4 rounded object-cover"
                              />
                            ) : (
                              <Paperclip className="w-3.5 h-3.5 text-slate-400 group-hover:text-nia-600" />
                            )}
                            <span className="font-medium text-slate-700 group-hover:text-nia-800 truncate max-w-[150px]">
                              {att.fileName}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenActivityModal(dateStr);
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              + Log Document Task
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenFieldWorkModal(dateStr);
              }}
              leftIcon={<Compass className="w-3.5 h-3.5" />}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              + Log Field Work (SM7)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

