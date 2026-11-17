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
  const [headOfDivision, setHeadOfDivision] = useState(userProfile.headOfDivision || 'ENGR. AL TED D. ABBOT');
  const [headOfOffice, setHeadOfOffice] = useState(userProfile.headOfOffice || 'ENGR. DEXTER A. SABLAON');
  const [formCode, setFormCode] = useState(userProfile.formCode || 'NIAROXI-AFD-Admin-INT-Form13Rev00');
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
      headOfDivision,
      headOfOffice,
      formCode,
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
            Civil Engineer profile, SPMS signatory designations, and official IPCR Form configuration
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
              <CardTitle>Civil Engineer Profile & Official Signatories</CardTitle>
              <Badge variant="blue">SPMS Form 13 Config</Badge>
            </CardHeader>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ratee Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 text-xs bg-white uppercase font-bold text-slate-800"
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
                <label className="block font-semibold text-slate-700 mb-1">Head of Division (Reviewer)</label>
                <input
                  type="text"
                  value={headOfDivision}
                  onChange={(e) => setHeadOfDivision(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 text-xs bg-white font-semibold uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Head of Office / Agency (Approver)</label>
                <input
                  type="text"
                  value={headOfOffice}
                  onChange={(e) => setHeadOfOffice(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 text-xs bg-white font-semibold uppercase"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Official IPCR Form Code</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 text-xs bg-white font-mono"
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
              <h3 className="text-sm font-bold text-white">SPMS Verification</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Configured strictly for <strong>{userProfile.fullName}</strong> at NIA Regional Office XI, matching form <strong>{userProfile.formCode}</strong>.
            </p>
            <div className="mt-4 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Strategic Priority Themes (SM7)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Core Functions (CF2M8, CF2M9)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Support Functions (SF4-A, SF4-B)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Civil Service Commission SPMS Ratings</span>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};
