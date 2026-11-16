import React from 'react';
import {
  Shield,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const SettingsPage: React.FC = () => {
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
          <Button variant="primary" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
            Save Preferences
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Identity & NIA Office Context (2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Civil Engineer Profile</CardTitle>
              <Badge variant="blue">Authenticated Single User</Badge>
            </CardHeader>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Position Title</label>
                <input
                  type="text"
                  readOnly
                  value="Civil Engineer"
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agency Name</label>
                <input
                  type="text"
                  readOnly
                  value="National Irrigation Administration (NIA)"
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Regional Office</label>
                <input
                  type="text"
                  readOnly
                  value="Regional Office XI (Davao Region)"
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operating Section</label>
                <input
                  type="text"
                  readOnly
                  value="Planning and Design Section"
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Division</label>
                <input
                  type="text"
                  readOnly
                  value="Engineering and Operations Division"
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 text-xs"
                />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <CardHeader>
              <CardTitle>Reporting Preferences</CardTitle>
              <CardDescription>Default filters and operational standards</CardDescription>
            </CardHeader>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">System Timezone</label>
                <input
                  type="text"
                  readOnly
                  value="Asia/Manila (PHT, UTC+8)"
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date Format Standard</label>
                <input
                  type="text"
                  readOnly
                  value="Philippine Standard (dd/MM/yyyy & MMMM d, yyyy)"
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Reporting Cycle</label>
                <select className="w-full rounded-lg border-slate-300 bg-white text-slate-800 px-3 py-2 text-xs">
                  <option value="SEM2">2nd Semester (July - December)</option>
                  <option value="SEM1">1st Semester (January - June)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Auto-Save Frequency</label>
                <select className="w-full rounded-lg border-slate-300 bg-white text-slate-800 px-3 py-2 text-xs">
                  <option value="30">Every 30 seconds</option>
                  <option value="60">Every 1 minute</option>
                </select>
              </div>
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
              This system is strictly architected for private single-user operation by the authorized Civil Engineer.
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
                <span>No Client-Exposed API Keys</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSC IPCR Strict Formatting</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
