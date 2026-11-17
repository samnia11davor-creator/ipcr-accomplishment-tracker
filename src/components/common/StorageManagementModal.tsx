import React, { useState } from 'react';
import {
  X,
  HardDrive,
  Download,
  Trash2,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Layers,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { StorageUsageStats } from '@/lib/storageMonitor';
import { purgeAttachmentsByIds } from '@/lib/attachmentStore';
import { useApp } from '@/contexts/AppContext';

interface StorageManagementModalProps {
  stats: StorageUsageStats;
  onClose: () => void;
}

export const StorageManagementModal: React.FC<StorageManagementModalProps> = ({
  stats,
  onClose,
}) => {
  const { activities, updateActivity, deleteActivity, downloadBackupSnapshot } = useApp();
  const [targetYear, setTargetYear] = useState<string>('2024');
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSuccessMessage, setPurgeSuccessMessage] = useState<string | null>(null);

  // Calculate year breakdown of tasks
  const activeActivities = activities.filter((a) => !a.isDeleted);
  const yearCounts = activeActivities.reduce((acc, act) => {
    const yr = String(act.calendarYear || act.activityDate?.slice(0, 4) || '2026');
    acc[yr] = (acc[yr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const yearsAvailable = Object.keys(yearCounts).sort().reverse();

  // Purge older tasks from a selected year
  const handlePurgeYear = async (deleteAttachmentsOnly: boolean) => {
    const matchingTasks = activeActivities.filter((act) => {
      const yr = String(act.calendarYear || act.activityDate?.slice(0, 4));
      return yr === targetYear;
    });

    if (matchingTasks.length === 0) {
      alert(`No active tasks found for CY ${targetYear}.`);
      return;
    }

    const confirmMsg = deleteAttachmentsOnly
      ? `Remove file attachments from ${matchingTasks.length} task(s) for CY ${targetYear}? (Your engineering text logs will stay intact).`
      : `Permanently delete ${matchingTasks.length} task(s) from CY ${targetYear}? We recommend exporting a backup first.`;

    if (!window.confirm(confirmMsg)) return;

    setIsPurging(true);
    setPurgeSuccessMessage(null);

    try {
      if (deleteAttachmentsOnly) {
        // Collect attachment IDs
        const attIds: string[] = [];
        matchingTasks.forEach((act) => {
          if (act.attachments && act.attachments.length > 0) {
            act.attachments.forEach((att) => attIds.push(att.id));
            updateActivity({
              ...act,
              attachments: [],
            });
          }
        });

        await purgeAttachmentsByIds(attIds);
        setPurgeSuccessMessage(
          `Successfully removed attachments from ${matchingTasks.length} task(s) for CY ${targetYear}. Memory reclaimed!`
        );
      } else {
        // Delete activities
        for (const act of matchingTasks) {
          if (act.attachments && act.attachments.length > 0) {
            await purgeAttachmentsByIds(act.attachments.map((a) => a.id));
          }
          deleteActivity(act.id);
        }
        setPurgeSuccessMessage(
          `Successfully purged ${matchingTasks.length} task(s) for CY ${targetYear}.`
        );
      }
    } catch (err) {
      console.error('Purge error:', err);
      alert('An error occurred during purge operation.');
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-nia-700 text-white flex items-center justify-center shadow-xs">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Free Tier Memory & Storage Monitor
              </h3>
              <p className="text-xs text-slate-500">
                Real-time tracking against the 1.0 GB Free Tier allocation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Main Storage Gauge Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Free Tier Space Utilized
                </span>
                <div className="text-2xl font-black text-white mt-0.5">
                  {stats.totalUsedFormatted}{' '}
                  <span className="text-sm font-normal text-slate-400">
                    / {stats.freeTierLimitFormatted} (1.0 GB Free Tier)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-emerald-400">
                  {stats.percentUsed}%
                </span>
                <p className="text-[10px] text-slate-400">Used</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700/80 rounded-full h-2.5 overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.healthStatus === 'CRITICAL'
                    ? 'bg-rose-500'
                    : stats.healthStatus === 'WARNING'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.max(stats.percentUsed, 1)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {stats.remainingFormatted} Available Headroom
              </span>
              <span className="text-slate-400 text-[11px]">
                Status: <strong className="text-white">{stats.statusMessage}</strong>
              </span>
            </div>
          </div>

          {/* Breakdown Cards */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-nia-600" />
              Storage Space Footprint by Category
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Attachments */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs text-purple-700 font-semibold mb-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Attachments</span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  {stats.breakdownFormatted.attachments}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Photos & PDFs</p>
              </div>

              {/* Activities */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Daily Tasks</span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  {stats.breakdownFormatted.activities}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{activeActivities.length} Records</p>
              </div>

              {/* Documents */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>DOC LOG</span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  {stats.breakdownFormatted.documents}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Documents</p>
              </div>

              {/* System */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>System</span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  {stats.breakdownFormatted.system}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Commitments & Audit</p>
              </div>
            </div>
          </div>

          {/* When Should I Delete Old Tasks Guidance */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Info className="w-4 h-4 text-blue-600" />
              <span>When Should I Delete Old Tasks or Records?</span>
            </div>
            <ul className="text-xs text-blue-800 space-y-1.5 list-disc pl-5 leading-relaxed">
              <li>
                <strong>No immediate rush:</strong> Your workspace is using less than <strong>{stats.percentUsed}%</strong> of the 1.0 GB free tier. Text task records take negligible space (~1 KB each).
              </li>
              <li>
                <strong>Keep active calendar year:</strong> Always retain records for the current evaluation period (e.g., <strong>CY 2026</strong>) for IPCR submission and CSC audit verification.
              </li>
              <li>
                <strong>Past calendar years (CY 2024 / 2025):</strong> Once your semestral rating is officially approved and signed by Engr. Al Ted Abbot and Engr. Dexter Sablaon, you can export a full backup before purging older entries.
              </li>
              <li>
                <strong>Save space without deleting logs:</strong> You can choose to <em>purge only file attachments</em> while keeping all your text accomplishment narratives intact!
              </li>
            </ul>
          </div>

          {/* Storage Cleanup & Archive Tool */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-slate-600" />
              Manage Past Records & Free Up Space
            </h4>

            {purgeSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{purgeSuccessMessage}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-semibold">Select Year:</span>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="text-xs rounded-xl border border-slate-300 py-1.5 px-3 bg-white font-semibold text-slate-800"
                >
                  {yearsAvailable.map((yr) => (
                    <option key={yr} value={yr}>
                      CY {yr} ({yearCounts[yr] || 0} tasks)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => downloadBackupSnapshot()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-nia-600" />
                  <span>1. Export Backup First</span>
                </button>

                <button
                  type="button"
                  disabled={isPurging}
                  onClick={() => handlePurgeYear(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors shadow-xs"
                  title="Keeps task text logs, deletes photos/PDFs only"
                >
                  <Trash2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Remove Attachments Only</span>
                </button>

                <button
                  type="button"
                  disabled={isPurging}
                  onClick={() => handlePurgeYear(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete CY {targetYear} Tasks</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            NIA Region XI • Planning & Design Section
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
