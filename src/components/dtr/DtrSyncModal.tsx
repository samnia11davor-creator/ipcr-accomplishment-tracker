import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  Calendar,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  parseNiaBiometricsText,
  DailyDtrSummary,
  saveDtrSummaries,
} from '@/lib/dtrParser';
import { useApp } from '@/contexts/AppContext';

interface DtrSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: (count: number) => void;
}

const SAMPLE_NIA_DTR_TEXT = `Success	11/17/2026 06:20:30 PM	0	SAM LESTER R. TAGUIBAO	176959	Bio1
Success	11/17/2026 12:37:03 PM	0	SAM LESTER R. TAGUIBAO	176959	Bio1
Success	11/17/2026 12:36:18 PM	0	SAM LESTER R. TAGUIBAO	176959	Bio1
Success	11/17/2026 08:28:17 AM	0	SAM LESTER R. TAGUIBAO	176959	Bio1
Success	11/16/2026 05:38:53 PM	0	SAM LESTER R. TAGUIBAO	176959	Bio1
Success	11/16/2026 12:33:36 PM	0	SAM LESTER R. TAGUIBAO	176959	Bio1
Success	11/13/2026 04:20:53 PM		Sam Lester Taguibao	176959	Web`;

export const DtrSyncModal: React.FC<DtrSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const { activities, updateActivity } = useApp();

  const [rawInput, setRawInput] = useState<string>('');
  const [parsedSummaries, setParsedSummaries] = useState<DailyDtrSummary[]>([]);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [syncApplied, setSyncApplied] = useState(false);
  const [autoUpdateActivities, setAutoUpdateActivities] = useState(true);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setRawInput(text);
    const results = parseNiaBiometricsText(text);
    setParsedSummaries(results);
    setSyncApplied(false);
  };

  const handleLoadSample = () => {
    handleParse(SAMPLE_NIA_DTR_TEXT);
  };

  const handleApplySync = () => {
    if (parsedSummaries.length === 0) return;

    // 1. Save DTR summaries to local storage
    saveDtrSummaries(parsedSummaries);

    // 2. Optionally update activity hours matching these dates
    let updatedCount = 0;
    if (autoUpdateActivities) {
      activities.forEach((act) => {
        const dtr = parsedSummaries.find((s) => s.date === act.activityDate);
        if (dtr && dtr.totalHours && act.timeSpentHours !== dtr.totalHours) {
          updateActivity({
            ...act,
            timeSpentHours: dtr.totalHours,
            remarks: act.remarks
              ? `${act.remarks} • Biometric DTR: ${dtr.timeIn || '—'} to ${dtr.timeOut || '—'} (${dtr.primaryMachine})`
              : `Biometric DTR Verified: ${dtr.timeIn || '—'} to ${dtr.timeOut || '—'} (${dtr.primaryMachine})`,
          });
          updatedCount++;
        }
      });
    }

    setSyncApplied(true);
    if (onSyncComplete) {
      onSyncComplete(parsedSummaries.length);
    }
  };

  // 1-Click Bookmarklet script
  const bookmarkletCode = `javascript:(function(){const rows=document.querySelectorAll("table tbody tr");let txt="";rows.forEach(r=>{const cols=Array.from(r.querySelectorAll("td")).map(td=>td.innerText.trim());if(cols.length>=4){txt+=cols.join("\t")+"\n";}});navigator.clipboard.writeText(txt).then(()=>{alert("Copied "+rows.length+" attendance punches to clipboard! Now switch to IPCR Tracker and paste.");}).catch(e=>{alert("Failed to copy: "+e);});})();`;

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">
                  NIA Biometrics & DTR Sync Center
                </h2>
                <Badge variant="emerald" size="sm" className="bg-white/20 text-white border-white/30">
                  attendance.region11.nia.gov.ph
                </Badge>
              </div>
              <p className="text-xs text-emerald-200">
                Sync guard house (Bio1) and web attendance time in / time out data directly into your IPCR Tracker
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

        {/* Portal Profile Banner */}
        <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Target Employee:</strong> ENGR. SAM LESTER R. TAGUIBAO &nbsp;•&nbsp;{' '}
              <strong>Employee ID:</strong> <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold">176959</code>
            </span>
          </div>

          <a
            href="https://attendance.region11.nia.gov.ph/Biometrics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 underline"
          >
            Open Office Biometrics Portal
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Instructions Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Method 1: Copy-Paste */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <span className="w-5 h-5 rounded-full bg-nia-700 text-white flex items-center justify-center text-[11px]">
                  1
                </span>
                Method 1: Direct Copy & Paste (Fastest)
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                On your open{' '}
                <a
                  href="https://attendance.region11.nia.gov.ph/Biometrics"
                  target="_blank"
                  rel="noreferrer"
                  className="text-nia-700 underline font-semibold"
                >
                  NIA Attendance tab
                </a>
                , highlight the table rows with your mouse, press <kbd className="bg-slate-200 px-1.5 py-0.5 rounded font-mono">Ctrl+C</kbd>, then paste below.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-[11px] font-semibold text-nia-700 hover:text-nia-900 underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-nia-600" />
                  Load sample data from your screenshot (Nov 13-17)
                </button>
              </div>
            </div>

            {/* Method 2: 1-Click Bookmarklet */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[11px]">
                  2
                </span>
                Method 2: 1-Click Chrome Bookmarklet
              </span>
              <p className="text-emerald-800 leading-relaxed text-[11px]">
                Copy this 1-line script and save it as a Chrome Bookmark. When viewing your attendance portal, click the bookmark to copy all rows instantly!
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyBookmarklet}
                leftIcon={copiedBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                className="w-full text-xs font-semibold bg-white border-emerald-300 text-emerald-900 hover:bg-emerald-100/60"
              >
                {copiedBookmarklet ? 'Copied Bookmarklet Code!' : 'Copy Chrome Bookmarklet Code'}
              </Button>
            </div>
          </div>

          {/* Paste Input Area */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Paste Attendance Data from attendance.region11.nia.gov.ph:</span>
              {parsedSummaries.length > 0 && (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Successfully parsed {parsedSummaries.length} calendar day{parsedSummaries.length > 1 ? 's' : ''}
                </span>
              )}
            </label>
            <textarea
              rows={4}
              value={rawInput}
              onChange={(e) => handleParse(e.target.value)}
              placeholder={`Paste attendance lines here, e.g.:\nSuccess  11/17/2026 06:20:30 PM  0  SAM LESTER R. TAGUIBAO  176959  Bio1\nSuccess  11/17/2026 08:28:17 AM  0  SAM LESTER R. TAGUIBAO  176959  Bio1...`}
              className="w-full font-mono text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 p-3 bg-slate-50/50"
            />
          </div>

          {/* Parsed Preview Table */}
          {parsedSummaries.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Parsed Biometric Daily Records ({parsedSummaries.length} days)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Guard House & Web punches consolidated
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Time In</th>
                      <th className="py-2.5 px-3">Time Out</th>
                      <th className="py-2.5 px-3 text-center">Net Work Hours</th>
                      <th className="py-2.5 px-3">Biometric Device</th>
                      <th className="py-2.5 px-3 text-center">Punches</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedSummaries.map((day) => (
                      <tr key={day.date} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {day.date}
                        </td>
                        <td className="py-2 px-3 font-semibold text-emerald-800">
                          {day.timeIn || '—'}
                        </td>
                        <td className="py-2 px-3 font-semibold text-blue-800">
                          {day.timeOut || '—'}
                        </td>
                        <td className="py-2 px-3 text-center font-bold font-mono text-slate-900">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {day.totalHours.toFixed(1)} hrs
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              day.isGuardHouseVerified
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {day.primaryMachine}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
                          {day.punchesCount} logs
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Options */}
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoUpdateActivities}
                    onChange={(e) => setAutoUpdateActivities(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    Auto-update daily activities on these dates with official biometric hours ({parsedSummaries.map((s) => s.totalHours).join(', ')} hrs)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Sync Success Banner */}
          {syncApplied && (
            <div className="p-3.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>
                  Successfully synced {parsedSummaries.length} days of official NIA Biometrics into your IPCR Tracker!
                </span>
              </div>
              <span className="text-xs text-emerald-800 font-semibold">
                Calendar & Activities Updated
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleApplySync}
            disabled={parsedSummaries.length === 0}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
          >
            {syncApplied
              ? 'Re-Sync Biometric Logs'
              : `Sync ${parsedSummaries.length} Biometric Days to Tracker`}
          </Button>
        </div>
      </div>
    </div>
  );
};

