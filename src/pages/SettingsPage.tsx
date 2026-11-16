import React, { useState } from 'react';
import {
  Shield,
  Save,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useApp } from '@/contexts/AppContext';

export const SettingsPage: React.FC = () => {
  const { userProfile, updateUserProfile, resetToDefaults } = useApp();

  const [fullName, setFullName] = useState(userProfile.fullName);
  const [positionTitle, setPositionTitle] = useState(userProfile.positionTitle);
  const [agency, setAgency] = useState(userProfile.agency);
  const [regionalOffice, setRegionalOffice] = useState(userProfile.regionalOffice);
  const [division, setDivision] = useState(userProfile.division);
  const [section, setSection] = useState(userProfile.section);
  const [supervisor, setSupervisor] = useState(userProfile.immediateSupervisor);
  const [supervisorPosition, setSupervisorPosition] = useState(userProfile.supervisorPosition);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      fullName,
      positionTitle,
      agency,
      regionalOffice,
      division,
      section,
      immediateSupervisor: supervisor,
      supervisorPosition,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System Settings & Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Civil Engineer profile, agency organizational context, and reporting preferences
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Preferences Saved!
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('Reset profile and data back to standard NIA Region XI defaults?')) {
                resetToDefaults();
              }
            }}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Defaults
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Identity & NIA Office Context (2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Civil Engineer Profile</CardTitle>
              <Badge variant="blue">Authenticated Single User</Badge>
            </CardHeader>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Position Title *</label>
                <input
                  type="text"
                  required
                  value={positionTitle}
                  onChange={(e) => setPositionTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agency Name</label>
                <input
                  type="text"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Regional Office</label>
                <input
                  type="text"
                  value={regionalOffice}
                  onChange={(e) => setRegionalOffice(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Division</label>
                <input
                  type="text"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operating Section</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Immediate Supervisor</label>
                <input
                  type="text"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supervisor Designation</label>
                <input
                  type="text"
                  value={supervisorPosition}
                  onChange={(e) => setSupervisorPosition(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 text-xs bg-white"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
                Save Profile Changes
              </Button>
            </div>
          </Card>
        </div>

        {/* Security & Isolation Summary (1 Col) */}
        <div className="space-y-6">
          <Card padding="md" className="bg-slate-900 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Security & Privacy</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This system is strictly architected for private single-user operation by Engr. Sam Taguibao at NIA Regional Office XI.
            </p>
            <div className="mt-4 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Public Registration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Owner-Scoped Firestore Rules</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSC Form 2017 Format Compliance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Exposure of API Secrets</span>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};
