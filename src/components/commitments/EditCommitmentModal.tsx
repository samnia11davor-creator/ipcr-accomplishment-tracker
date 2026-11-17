import React, { useState } from 'react';
import { X, CheckCircle2, FileText, DollarSign, UserCheck } from 'lucide-react';
import { IpcrCommitment } from '@/types';
import { Button } from '@/components/common/Button';

interface EditCommitmentModalProps {
  commitment: IpcrCommitment;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: IpcrCommitment) => void;
}

export const EditCommitmentModal: React.FC<EditCommitmentModalProps> = ({
  commitment,
  isOpen,
  onClose,
  onSave,
}) => {
  const [successIndicator, setSuccessIndicator] = useState(commitment.successIndicator);
  const [target, setTarget] = useState(commitment.target);
  const [allottedBudget, setAllottedBudget] = useState<string>(
    commitment.allottedBudget !== null ? String(commitment.allottedBudget) : ''
  );
  const [accountableDivision, setAccountableDivision] = useState(commitment.accountableDivision);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...commitment,
      successIndicator: successIndicator.trim(),
      target: target.trim() || successIndicator.trim(),
      allottedBudget: allottedBudget ? Number(allottedBudget) : null,
      accountableDivision: accountableDivision.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-nia-700 text-white flex items-center justify-center font-bold text-sm">
              {commitment.commitmentCode}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Success Indicator</h2>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[420px]">
                {commitment.mfoPap}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Note Banner */}
          <div className="bg-blue-50 border border-blue-200/70 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">SPMS Standard:</span> Edit the approved Success Indicator narrative directly as one block. Specific projects (e.g. Suawan SRIP, Pagan SRIP) and quantities are dynamically gathered from your daily engineering logs.
            </div>
          </div>

          {/* Success Indicator narrative */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Success Indicator (Target + Measures Narrative) *
            </label>
            <textarea
              rows={4}
              required
              value={successIndicator}
              onChange={(e) => {
                setSuccessIndicator(e.target.value);
                if (!target || target === commitment.target) {
                  setTarget(e.target.value);
                }
              }}
              placeholder="e.g. 1.) Monitored and evaluated projects for the conduct of Feasibility Study (FS) on or before set deadline..."
              className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-nia-500 focus:border-nia-500 font-medium leading-relaxed bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Allotted Budget */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Allotted Budget (PHP)
              </label>
              <input
                type="number"
                value={allottedBudget}
                onChange={(e) => setAllottedBudget(e.target.value)}
                placeholder="e.g. 1200000"
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-nia-500 focus:border-nia-500 bg-slate-50/50"
              />
            </div>

            {/* Accountable Division / Section */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Accountable Division / Personnel
              </label>
              <input
                type="text"
                value={accountableDivision}
                onChange={(e) => setAccountableDivision(e.target.value)}
                placeholder="Planning and Design Section / Civil Engineer"
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-nia-500 focus:border-nia-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              Save Indicator Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
