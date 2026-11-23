import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Target,
  ChevronDown,
  ChevronUp,
  Check,
  Search,
  Sparkles,
  X,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { IpcrCommitment, SpmsTier } from '@/types';
import { Badge } from '@/components/common/Badge';

export interface CommitmentSelectProps {
  value: string;
  onChange: (commitmentId: string) => void;
  commitments: IpcrCommitment[];
  label?: string;
  required?: boolean;
  allowAutoClassify?: boolean;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const CommitmentSelect: React.FC<CommitmentSelectProps> = ({
  value,
  onChange,
  commitments,
  label,
  required = false,
  allowAutoClassify = false,
  placeholder = 'Select target IPCR commitment / goal...',
  className = '',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedCommitment = useMemo(
    () => commitments.find((c) => c.id === value),
    [commitments, value]
  );

  // Filtered commitments based on search query
  const filteredCommitments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return commitments;

    return commitments.filter(
      (c) =>
        (c.commitmentCode || '').toLowerCase().includes(q) ||
        (c.mfoPap || '').toLowerCase().includes(q) ||
        (c.target || '').toLowerCase().includes(q) ||
        (c.themeCategory && c.themeCategory.toLowerCase().includes(q)) ||
        (c.strategicObjective && c.strategicObjective.toLowerCase().includes(q))
    );
  }, [commitments, searchQuery]);

  // Group by Tier
  const strategicList = filteredCommitments.filter((c) => c.tier === 'STRATEGIC');
  const coreList = filteredCommitments.filter((c) => c.tier === 'CORE');
  const supportList = filteredCommitments.filter((c) => c.tier === 'SUPPORT');

  const getTierBadge = (tier: SpmsTier) => {
    switch (tier) {
      case 'STRATEGIC':
        return <Badge variant="purple" size="sm">I. Strategic</Badge>;
      case 'CORE':
        return <Badge variant="emerald" size="sm">II. Core</Badge>;
      case 'SUPPORT':
        return <Badge variant="amber" size="sm">III. Support</Badge>;
      default:
        return <Badge variant="slate" size="sm">Goal</Badge>;
    }
  };

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-nia-600" />
            {label}
            {required && <span className="text-red-500">*</span>}
          </span>
          <span className="text-[10px] text-slate-500">Auto-links to IPCR rating</span>
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full text-left transition-all rounded-xl border px-3.5 py-2.5 bg-white shadow-2xs flex items-center justify-between gap-2.5 focus:outline-none focus:ring-2 focus:ring-nia-500/20 ${
          isOpen
            ? 'border-nia-500 ring-2 ring-nia-500/20'
            : error
            ? 'border-red-400 bg-red-50/20'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="min-w-0 flex-1">
          {selectedCommitment ? (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {getTierBadge(selectedCommitment.tier)}
                <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  [{selectedCommitment.commitmentCode}]
                </span>
                <span className="text-[11px] font-bold text-slate-600 truncate max-w-[280px] sm:max-w-[360px]">
                  {(selectedCommitment.mfoPap || '').replace(/^STRATEGIC MEASURE \d+\.\s*|^CORE FUNCTION \d+\s*MEASURE \d+\.\s*|^SF\d+\.\s*/i, '')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Target: {selectedCommitment.target || 'N/A'}
              </p>
            </div>
          ) : allowAutoClassify && !value ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-nia-800">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Auto-classify with AI (Auto-matches your deliverables)</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-medium">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {/* Dropdown Menu (Guaranteed to stay within width and frame) */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 left-0 right-0 top-full mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-80 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Search Bar inside dropdown */}
          <div className="p-2.5 bg-slate-50/80 border-b border-slate-200 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search goals by code (e.g. SM7, CF2, SF4) or keyword..."
                className="w-full text-xs pl-8 pr-7 py-1.5 rounded-lg border border-slate-200 focus:border-nia-500 focus:ring-1 focus:ring-nia-500 bg-white placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1 p-2 space-y-3 divide-y divide-slate-100">
            {/* Auto-classify Option (if enabled) */}
            {allowAutoClassify && (
              <div className="pb-1">
                <button
                  type="button"
                  onClick={() => handleSelect('')}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                    value === ''
                      ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/30'
                      : 'hover:bg-slate-50 border-slate-200 bg-slate-50/30'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Auto-classify with AI</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      Intelligently suggest and assign the right Strategic, Core, or Support function based on your output description.
                    </p>
                  </div>
                  {value === '' && <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                </button>
              </div>
            )}

            {/* Empty state when query matches nothing */}
            {filteredCommitments.length === 0 && (
              <div className="py-6 px-4 text-center">
                <Layers className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No matching IPCR goals found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Try searching for &quot;SM7&quot;, &quot;POW&quot;, &quot;reports&quot;, or &quot;meetings&quot;</p>
              </div>
            )}

            {/* Strategic Priorities */}
            {strategicList.length > 0 && (
              <div className="space-y-1.5 pt-2 first:pt-0">
                <div className="px-1 text-[10px] font-bold tracking-wider text-purple-900 uppercase flex items-center justify-between">
                  <span>I. Strategic Priorities (POWs & FSDE)</span>
                  <span className="text-[9px] text-purple-600 font-semibold">{strategicList.length} targets</span>
                </div>
                {strategicList.map((com) => {
                  const isSelected = value === com.id;
                  return (
                    <button
                      key={com.id}
                      type="button"
                      onClick={() => handleSelect(com.id)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-purple-50/80 border-purple-300 ring-1 ring-purple-400/30 shadow-2xs'
                          : 'hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-xs text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200">
                            [{com.commitmentCode}]
                          </span>
                          <span className="text-xs font-bold text-slate-900 leading-snug break-words">
                            {com.mfoPap}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug break-words">
                          <strong className="text-slate-700">Target:</strong> {com.target}
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Core Functions */}
            {coreList.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="px-1 text-[10px] font-bold tracking-wider text-emerald-900 uppercase flex items-center justify-between">
                  <span>II. Core Functions (Monitoring, Review, Coordination)</span>
                  <span className="text-[9px] text-emerald-600 font-semibold">{coreList.length} targets</span>
                </div>
                {coreList.map((com) => {
                  const isSelected = value === com.id;
                  return (
                    <button
                      key={com.id}
                      type="button"
                      onClick={() => handleSelect(com.id)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/30 shadow-2xs'
                          : 'hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-xs text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                            [{com.commitmentCode}]
                          </span>
                          <span className="text-xs font-bold text-slate-900 leading-snug break-words">
                            {com.mfoPap}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug break-words">
                          <strong className="text-slate-700">Target:</strong> {com.target}
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Support Functions */}
            {supportList.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="px-1 text-[10px] font-bold tracking-wider text-amber-900 uppercase flex items-center justify-between">
                  <span>III. Support Functions (Archiving, Routing, 5S)</span>
                  <span className="text-[9px] text-amber-600 font-semibold">{supportList.length} targets</span>
                </div>
                {supportList.map((com) => {
                  const isSelected = value === com.id;
                  return (
                    <button
                      key={com.id}
                      type="button"
                      onClick={() => handleSelect(com.id)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400/30 shadow-2xs'
                          : 'hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-xs text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                            [{com.commitmentCode}]
                          </span>
                          <span className="text-xs font-bold text-slate-900 leading-snug break-words">
                            {com.mfoPap}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug break-words">
                          <strong className="text-slate-700">Target:</strong> {com.target}
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Clean Footer of Dropdown */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Select the matching target from your IPCR form</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-nia-700 hover:text-nia-900 font-semibold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

