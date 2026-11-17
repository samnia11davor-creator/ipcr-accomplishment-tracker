import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  FileSpreadsheet,
  Target,
  Award,
  FileText,
  UploadCloud,
  ShieldCheck,
  Settings,
  ChevronRight,
  Droplets,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { StorageMonitorPill } from '../common/StorageMonitorPill';

export const Sidebar: React.FC = () => {
  const { activities, documents } = useApp();

  const activeActivitiesCount = activities.filter((a) => !a.isDeleted).length;
  const fieldWorksCount = activities.filter((a) => !a.isDeleted && a.isFieldWork).length;
  const pendingDocsCount = documents.filter((d) => !d.isDeleted && d.status === 'Pending').length;

  const navItems = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Daily Activities', to: '/activities', icon: CalendarCheck, badge: activeActivitiesCount > 0 ? String(activeActivitiesCount) : undefined },
    { name: 'Calendar & Field Work', to: '/calendar', icon: Calendar, badge: fieldWorksCount > 0 ? `${fieldWorksCount} FW` : undefined },
    { name: 'Document Monitoring', to: '/documents', icon: FileSpreadsheet, badge: pendingDocsCount > 0 ? String(pendingDocsCount) : undefined },
    { name: 'IPCR Commitments', to: '/commitments', icon: Target },
    { name: 'Accomplishment Monitoring', to: '/accomplishments', icon: Award },
    { name: 'Report Generator', to: '/reports', icon: FileText },
    { name: 'Import Data', to: '/import', icon: UploadCloud },
    { name: 'Backup & Audit', to: '/backup', icon: ShieldCheck },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-nia-500 to-nia-700 flex items-center justify-center text-white shadow-md shadow-nia-950/50">
          <Droplets className="w-5 h-5 text-sky-200" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            IPCR Tracker
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-nia-500/20 text-nia-400 border border-nia-500/30">
              v1.0
            </span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">NIA Regional Office XI</span>
        </div>
      </div>

      {/* Office & Section Context Pill */}
      <div className="px-3 pt-3 pb-1">
        <div className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-750 text-xs">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Office Section</div>
          <div className="text-slate-200 font-medium truncate">Planning & Design Section</div>
          <div className="text-[11px] text-slate-400">Civil Engineer Workspace</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Main Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-nia-600 text-white shadow-sm shadow-nia-900/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge ? (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : (
                    isActive && <ChevronRight className="w-3.5 h-3.5 text-nia-200 opacity-80" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info & Operational Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/30 space-y-2.5">
        {/* Real-time Free Tier Memory Monitor */}
        <StorageMonitorPill variant="sidebar" />

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Live & Ready
          </span>
          <span className="text-[10px] font-mono text-slate-500">PHT (UTC+8)</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Private single-user workspace. Automatic local & cloud recovery enabled.
        </p>
      </div>
    </aside>
  );
};
