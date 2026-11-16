import React, { useState, useEffect } from 'react';
import { Clock, HardDrive, CheckCircle2 } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { MANILA_TZ } from '@/lib/dates';
import { Badge } from '../common/Badge';
import { useApp } from '@/contexts/AppContext';

export const Header: React.FC = () => {
  const { userProfile, selectedPeriod } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(formatInTimeZone(now, MANILA_TZ, 'EEE, MMMM d, yyyy • hh:mm:ss a'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10">
      {/* Left: Active Cycle & Manila Live Time */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="blue" size="md" className="font-semibold px-3 py-1">
            Active Cycle: {selectedPeriod === 'SEM2' ? '2nd Sem 2026 (Jul - Dec)' : selectedPeriod === 'SEM1' ? '1st Sem 2026 (Jan - Jun)' : `${selectedPeriod} 2026`}
          </Badge>
          <span className="text-slate-300">|</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentTime || 'Loading PHT Time...'}</span>
          <span className="text-[10px] text-slate-400 font-sans font-medium">(Asia/Manila)</span>
        </div>
      </div>

      {/* Right: User Profile & Security Status */}
      <div className="flex items-center gap-3">
        {/* Local-First & Cloud Ready Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium">Tracker Active</span>
        </div>

        {/* Audit/Backup quick link status */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
          <span>Auto-Persist On</span>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* User Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-nia-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-nia-100 shadow-sm">
            {userProfile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">{userProfile.fullName}</span>
            <span className="text-[10px] text-slate-500">{userProfile.positionTitle} • NIA RO-XI</span>
          </div>
        </div>
      </div>
    </header>
  );
};
