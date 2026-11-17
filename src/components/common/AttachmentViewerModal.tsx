import React, { useEffect, useState } from 'react';
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  Loader2,
} from 'lucide-react';
import { TaskAttachment } from '@/types';
import { getAttachmentBlob, downloadAttachment } from '@/lib/attachmentStore';
import { formatBytes } from '@/lib/storageMonitor';

interface AttachmentViewerModalProps {
  attachment: TaskAttachment | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const AttachmentViewerModal: React.FC<AttachmentViewerModalProps> = ({
  attachment,
  onClose,
  onDelete,
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let activeUrl: string | null = null;

    if (attachment) {
      setIsLoading(true);
      getAttachmentBlob(attachment.id)
        .then((blob) => {
          if (blob) {
            activeUrl = URL.createObjectURL(blob);
            setObjectUrl(activeUrl);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setObjectUrl(null);
    }

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [attachment]);

  if (!attachment) return null;

  const isImage = attachment.fileType.startsWith('image/');
  const isPdf = attachment.fileType.includes('pdf');
  const isExcel =
    attachment.fileType.includes('sheet') ||
    attachment.fileType.includes('excel') ||
    attachment.fileType.includes('csv');
  const isWord =
    attachment.fileType.includes('word') || attachment.fileType.includes('document');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-white border border-slate-200 shrink-0">
              {isImage ? (
                <ImageIcon className="w-4 h-4 text-purple-600" />
              ) : isPdf ? (
                <FileText className="w-4 h-4 text-rose-600" />
              ) : isExcel ? (
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              ) : isWord ? (
                <FileText className="w-4 h-4 text-blue-600" />
              ) : (
                <File className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                {attachment.fileName}
              </h3>
              <p className="text-[10px] text-slate-500">
                {formatBytes(attachment.fileSize)} • Attached on {new Date(attachment.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadAttachment(attachment.id, attachment.fileName)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-nia-700 hover:bg-nia-800 rounded-xl transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/5 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-nia-600" />
              <span>Loading file preview...</span>
            </div>
          ) : isImage && objectUrl ? (
            <img
              src={objectUrl}
              alt={attachment.fileName}
              className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-md"
            />
          ) : isPdf && objectUrl ? (
            <iframe
              src={objectUrl}
              title={attachment.fileName}
              className="w-full h-[65vh] rounded-xl border border-slate-200"
            />
          ) : (
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-nia-50 text-nia-700 flex items-center justify-center mb-3">
                {isExcel ? (
                  <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                ) : isWord ? (
                  <FileText className="w-8 h-8 text-blue-600" />
                ) : (
                  <File className="w-8 h-8 text-slate-500" />
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                {attachment.fileName}
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                This {isExcel ? 'Excel Spreadsheet' : isWord ? 'Word Document' : 'document'} is stored securely in your local vault. Click below to download and view in Microsoft Office or your preferred application.
              </p>
              <button
                onClick={() => downloadAttachment(attachment.id, attachment.fileName)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-nia-700 hover:bg-nia-800 rounded-xl transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download and Open File ({formatBytes(attachment.fileSize)})
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {onDelete && (
          <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              ID: {attachment.id}
            </span>
            <button
              onClick={() => {
                if (window.confirm(`Delete attachment "${attachment.fileName}"?`)) {
                  onDelete(attachment.id);
                  onClose();
                }
              }}
              className="text-rose-600 hover:text-rose-800 font-semibold"
            >
              Delete from Vault
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

