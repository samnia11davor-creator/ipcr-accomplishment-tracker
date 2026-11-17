/**
 * IPCR Accomplishment Tracker - Storage & Free Tier Memory Monitor
 * Calculates real-time footprint of local storage, IndexedDB attachments,
 * and tracks usage against the 1.0 GB Free Tier allowance.
 */

import { getTotalAttachmentBytes } from './attachmentStore';

export interface StorageBreakdown {
  attachmentsBytes: number;
  activitiesBytes: number;
  documentsBytes: number;
  systemBytes: number;
  totalUsedBytes: number;
}

export interface StorageUsageStats {
  totalUsedBytes: number;
  totalUsedFormatted: string;
  freeTierLimitBytes: number;
  freeTierLimitFormatted: string;
  percentUsed: number;
  remainingBytes: number;
  remainingFormatted: string;
  breakdown: StorageBreakdown;
  breakdownFormatted: {
    attachments: string;
    activities: string;
    documents: string;
    system: string;
  };
  healthStatus: 'HEALTHY' | 'MODERATE' | 'WARNING' | 'CRITICAL';
  statusMessage: string;
  recommendation: string;
  browserQuotaEstimate?: {
    usageBytes: number;
    quotaBytes: number;
    percentOfBrowserQuota: number;
  };
}

// Reference Free Tier Quota: 1,024 MB (1.0 GB Spark tier reference)
export const FREE_TIER_QUOTA_BYTES = 1024 * 1024 * 1024; // 1,073,741,824 bytes

/**
 * Format bytes to human readable KB, MB, GB
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 KB';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Calculate LocalStorage bytes per key category
 */
function getLocalStorageStats(): {
  activitiesBytes: number;
  documentsBytes: number;
  systemBytes: number;
  totalLocalBytes: number;
} {
  let activitiesBytes = 0;
  let documentsBytes = 0;
  let systemBytes = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const val = localStorage.getItem(key) || '';
      // In JS, UTF-16 characters take ~2 bytes each
      const byteSize = (key.length + val.length) * 2;

      if (key.includes('activities')) {
        activitiesBytes += byteSize;
      } else if (key.includes('documents')) {
        documentsBytes += byteSize;
      } else {
        systemBytes += byteSize;
      }
    }
  } catch {
    // ignore
  }

  return {
    activitiesBytes,
    documentsBytes,
    systemBytes,
    totalLocalBytes: activitiesBytes + documentsBytes + systemBytes,
  };
}

/**
 * Get comprehensive storage usage statistics
 */
export async function getStorageUsageStats(
  customFreeTierLimit = FREE_TIER_QUOTA_BYTES
): Promise<StorageUsageStats> {
  const localStats = getLocalStorageStats();
  const attachmentsBytes = await getTotalAttachmentBytes();

  const totalUsedBytes = localStats.totalLocalBytes + attachmentsBytes;
  const percentUsed = Math.min(100, parseFloat(((totalUsedBytes / customFreeTierLimit) * 100).toFixed(2)));
  const remainingBytes = Math.max(0, customFreeTierLimit - totalUsedBytes);

  let healthStatus: StorageUsageStats['healthStatus'] = 'HEALTHY';
  let statusMessage = 'Optimal storage headroom available';
  let recommendation =
    'Your workspace is operating well within the free tier. No deletion needed.';

  if (percentUsed >= 90) {
    healthStatus = 'CRITICAL';
    statusMessage = 'Free Tier Storage Nearly Full (90%+ utilized)';
    recommendation =
      'Action needed: Export your semestral records to Excel/JSON and purge older completed tasks or large photo attachments to prevent disruption.';
  } else if (percentUsed >= 70) {
    healthStatus = 'WARNING';
    statusMessage = 'Storage utilization is elevated (70%+)';
    recommendation =
      'Notice: Review older tasks from past calendar years (e.g., CY 2024 or earlier). Export an archive backup before removing unneeded photo attachments.';
  } else if (percentUsed >= 40) {
    healthStatus = 'MODERATE';
    statusMessage = 'Healthy storage headroom';
    recommendation =
      'Routine monitoring: Keep active semestral records. High-resolution photos and PDF attachments contribute most to space.';
  }

  // Check browser quota estimate if available
  let browserQuotaEstimate: StorageUsageStats['browserQuotaEstimate'];
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage !== undefined && estimate.quota !== undefined) {
        browserQuotaEstimate = {
          usageBytes: estimate.usage,
          quotaBytes: estimate.quota,
          percentOfBrowserQuota: parseFloat(
            ((estimate.usage / estimate.quota) * 100).toFixed(2)
          ),
        };
      }
    } catch {
      // ignore
    }
  }

  return {
    totalUsedBytes,
    totalUsedFormatted: formatBytes(totalUsedBytes),
    freeTierLimitBytes: customFreeTierLimit,
    freeTierLimitFormatted: formatBytes(customFreeTierLimit),
    percentUsed,
    remainingBytes,
    remainingFormatted: formatBytes(remainingBytes),
    breakdown: {
      attachmentsBytes,
      activitiesBytes: localStats.activitiesBytes,
      documentsBytes: localStats.documentsBytes,
      systemBytes: localStats.systemBytes,
      totalUsedBytes,
    },
    breakdownFormatted: {
      attachments: formatBytes(attachmentsBytes),
      activities: formatBytes(localStats.activitiesBytes),
      documents: formatBytes(localStats.documentsBytes),
      system: formatBytes(localStats.systemBytes),
    },
    healthStatus,
    statusMessage,
    recommendation,
    browserQuotaEstimate,
  };
}

