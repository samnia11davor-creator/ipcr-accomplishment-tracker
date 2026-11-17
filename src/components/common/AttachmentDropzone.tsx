import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  X,
  File,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { TaskAttachment } from '@/types';
import { saveAttachment } from '@/lib/attachmentStore';
import { formatBytes } from '@/lib/storageMonitor';

interface AttachmentDropzoneProps {
  attachments: TaskAttachment[];
  onChange: (attachments: TaskAttachment[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export const AttachmentDropzone: React.FC<AttachmentDropzoneProps> = ({
  attachments,
  onChange,
  maxFiles = 5,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-purple-600" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-rose-600" />;
    if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('csv')) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    }
    if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="w-4 h-4 text-blue-600" />;
    }
    return <File className="w-4 h-4 text-slate-500" />;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    if (attachments.length + files.length > maxFiles) {
      setErrorMessage(`Maximum ${maxFiles} attachments allowed per record.`);
      return;
    }

    setIsUploading(true);
    const newAttachments: TaskAttachment[] = [...attachments];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Size check (max 25MB per file)
        if (file.size > 25 * 1024 * 1024) {
          setErrorMessage(`File "${file.name}" is over 25MB. Please choose a smaller file.`);
          continue;
        }

        // Save to IndexedDB
        const saved = await saveAttachment(file);
        newAttachments.push(saved);
      }

      onChange(newAttachments);
    } catch (err) {
      console.error('Failed to attach file:', err);
      setErrorMessage('Failed to save attachment to local storage. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (id: string) => {
    const updated = attachments.filter((a) => a.id !== id);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => {
          if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-nia-500 bg-nia-50/70 scale-[0.99]'
            : 'border-slate-300 hover:border-nia-400 hover:bg-slate-50/60 bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          disabled={disabled || isUploading}
          onChange={(e) => handleFiles(e.target.files)}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="w-10 h-10 rounded-full bg-nia-50 text-nia-700 flex items-center justify-center shadow-xs">
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">
              {isUploading ? 'Saving attachment locally...' : 'Click or drag files here to attach'}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Supports site photos, inspection images, PDF reports, Word (.docx), & Excel (.xlsx) up to 25MB
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
          {errorMessage}
        </div>
      )}

      {/* Attachment List */}
      {attachments.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 px-1">
            <span>Attached Files ({attachments.length}/{maxFiles})</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Stored locally in vault
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {att.thumbnailUrl ? (
                    <img
                      src={att.thumbnailUrl}
                      alt={att.fileName}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-300 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      {getFileIcon(att.fileType)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-[11px]">
                      {att.fileName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatBytes(att.fileSize)}
                    </p>
                  </div>
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(att.id);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-2 shrink-0"
                    title="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
