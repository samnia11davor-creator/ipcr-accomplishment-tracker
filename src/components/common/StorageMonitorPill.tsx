import React, { useState, useEffect } from 'react';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { getStorageUsageStats, StorageUsageStats } from '@/lib/storageMonitor';
import { StorageManagementModal } from './StorageManagementModal';
import { useApp } from '@/contexts/AppContext';

interface StorageMonitorPillProps {
  variant?: 'compact' | 'detailed' | 'sidebar';
  className?: string;
}

export const StorageMonitorPill: React.FC<StorageMonitorPillProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { activities, documents } = useApp();
  const [stats, setStats] = useState<StorageUsageStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshStats = () => {
    getStorageUsageStats().then(setStats);
  };

  useEffect(() => {
    refreshStats();
  }, [activities, documents]);

  if (!stats) return null;

  const isWarning = stats.healthStatus === 'WARNING';
  const isCritical = stats.healthStatus === 'CRITICAL';

  if (variant === 'sidebar') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`w-full text-left p-2.5 rounded-xl border transition-all ${
            isCritical
              ? 'bg-rose-950/40 border-rose-800 text-rose-300'
              : isWarning
              ? 'bg-amber-950/40 border-amber-800 text-amber-300'
              : 'bg-slate-800/60 border-slate-750 text-slate-300 hover:bg-slate-800'
          } ${className}`}
        >
          <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-nia-400" />
              <span>Free Tier Memory</span>
            </span>
            <span className="font-mono text-[10px]">
              {stats.percentUsed}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-700/80 rounded-full h-1.5 overflow-hidden mb-1.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCritical
                  ? 'bg-rose-500'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.max(stats.percentUsed, 2)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>{stats.totalUsedFormatted} used</span>
            <span>1.0 GB Spark Tier</span>
          </div>
        </button>

        {isModalOpen && (
          <StorageManagementModal
            stats={stats}
            onClose={() => {
              setIsModalOpen(false);
              refreshStats();
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        title="Click to view Free Tier storage breakdown and management"
        className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs transition-all ${
          isCritical
            ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
            : isWarning
            ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/70 hover:border-slate-300'
        } ${className}`}
      >
        <HardDrive className={`w-3.5 h-3.5 ${isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-500'}`} />
        <span className="font-medium text-[11px]">
          Free Tier: <strong className="font-semibold">{stats.totalUsedFormatted}</strong> / 1.0 GB
        </span>

        {isCritical ? (
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
        ) : isWarning ? (
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        )}
      </button>

      {isModalOpen && (
        <StorageManagementModal
          stats={stats}
          onClose={() => {
            setIsModalOpen(false);
            refreshStats();
          }}
        />
      )}
    </>
  );
};
