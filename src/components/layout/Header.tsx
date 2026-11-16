import React, { useState, useEffect } from 'react';
import { Clock, HardDrive, CheckCircle2 } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { MANILA_TZ } from '@/lib/dates';
import { Badge } from '../common/Badge';

export const Header: React.FC = () => {
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
            Active Cycle: 2nd Sem 2026 (Jul - Dec)
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
        {/* Standalone Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium">Phase 0 Ready</span>
        </div>

        {/* Audit/Backup quick link status */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
          <span>Local Verified</span>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* User Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-nia-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-nia-100">
            CE
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">Civil Engineer</span>
            <span className="text-[10px] text-slate-500">NIA RO-XI Planning & Design</span>
          </div>
        </div>
      </div>
    </header>
  );
};
