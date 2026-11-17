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
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { DailyActivity, TaskAttachment } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  activities: DailyActivity[];
  onOpenFieldWorkModal: (date: string) => void;
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
              {fieldWorks.length} Field Work{fieldWorks.length === 1 ? '' : 's'} ({fieldWorkUnits} site{fieldWorkUnits === 1 ? '' : 's'})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{totalHours.toFixed(1)} hrs total</span>
          </div>
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {dayActivities.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No work logged for this date</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Use the buttons below to record a field investigation (for SM7 POW) or a regular engineering document logsheet entry.
              </p>
            </div>
          ) : (
            dayActivities.map((act) => {
              const matchedCommitment = commitments.find((c) => c.id === act.commitmentId);
              const isFw = act.isFieldWork;

              return (
                <div
                  key={act.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isFw
                      ? 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  {/* Card Top Row: Type & Hours */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-2.5">
                    <div className="flex items-center gap-2">
                      {isFw ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <Compass className="w-3 h-3 text-emerald-700" />
                          Field Work (SM7 POW) • {act.fieldWorkCount || 1} site
                        </span>
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
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onOpenActivityModal(dateStr);
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Log Document Task
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
              Log Field Work (SM7)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
