/**
 * IPCR Accomplishment Tracker - Attachment Storage Engine
 * Uses IndexedDB to store photos, PDFs, Word docs, and Excel files locally
 * without exhausting the 5MB browser LocalStorage quota.
 */

import { TaskAttachment } from '@/types';

const DB_NAME = 'ipcr_attachment_vault';
const DB_VERSION = 1;
const STORE_NAME = 'task_attachments';

interface StoredAttachmentRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  dataBlob: Blob;
  thumbnailUrl?: string;
}

/**
 * Open or initialize the IndexedDB database
 */
function openAttachmentDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Generate a tiny thumbnail dataUrl for image files to display fast without loading large blobs
 */
function generateImageThumbnail(file: File, maxDim = 120): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(undefined);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          resolve(undefined);
        }
      };
      img.onerror = () => resolve(undefined);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}

/**
 * Save an attached file into IndexedDB and return its metadata
 */
export async function saveAttachment(file: File): Promise<TaskAttachment> {
  const db = await openAttachmentDb();
  const attachmentId = `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  // Create lightweight thumbnail if it's a photo
  const thumbnailUrl = await generateImageThumbnail(file);

  const record: StoredAttachmentRecord = {
    id: attachmentId,
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
    uploadedAt: now,
    dataBlob: file,
    thumbnailUrl,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onsuccess = () => {
      resolve({
        id: attachmentId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        uploadedAt: now,
        thumbnailUrl,
        storageKey: attachmentId,
      });
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to save attachment to IndexedDB'));
    };
  });
}

/**
 * Retrieve the Blob or Object URL for an attachment
 */
export async function getAttachmentBlob(attachmentId: string): Promise<Blob | null> {
  const db = await openAttachmentDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(attachmentId);

    request.onsuccess = () => {
      const result = request.result as StoredAttachmentRecord | undefined;
      resolve(result ? result.dataBlob : null);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to retrieve attachment'));
    };
  });
}

/**
 * Open or download an attachment directly
 */
export async function downloadAttachment(attachmentId: string, fileName: string): Promise<void> {
  const blob = await getAttachmentBlob(attachmentId);
  if (!blob) {
    alert('Attachment file could not be found in local storage.');
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Delete a specific attachment from IndexedDB
 */
export async function deleteAttachment(attachmentId: string): Promise<void> {
  const db = await openAttachmentDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(attachmentId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error('Failed to delete attachment'));
  });
}

/**
 * Calculate total bytes stored in the attachment IndexedDB
 */
export async function getTotalAttachmentBytes(): Promise<number> {
  try {
    const db = await openAttachmentDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.openCursor();
      let total = 0;

      request.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const rec = cursor.value as StoredAttachmentRecord;
          total += rec.fileSize || 0;
          cursor.continue();
        } else {
          resolve(total);
        }
      };

      request.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}

/**
 * Batch purge attachments by ID to free up space
 */
export async function purgeAttachmentsByIds(attachmentIds: string[]): Promise<number> {
  if (attachmentIds.length === 0) return 0;
  const db = await openAttachmentDb();

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    let deletedCount = 0;

    attachmentIds.forEach((id) => {
      store.delete(id);
      deletedCount++;
    });

    tx.oncomplete = () => resolve(deletedCount);
    tx.onerror = () => resolve(0);
  });
}
