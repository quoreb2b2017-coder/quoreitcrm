'use client';

import { useCallback, useState } from 'react';
import { api } from '@/services/api';
import type { CloudinaryFile } from '@/types';

type UploadType = 'resume' | 'document' | 'profile';

const ACCEPT: Record<UploadType, string> = {
  resume: 'application/pdf',
  document: 'application/pdf,image/jpeg,image/png,image/webp',
  profile: 'image/jpeg,image/png,image/webp,image/gif',
};

const LABEL: Record<UploadType, string> = {
  resume: 'PDF resume',
  document: 'PDF or image',
  profile: 'Profile photo',
};

interface FileUploadProps {
  type: UploadType;
  value: CloudinaryFile | null;
  onChange: (file: CloudinaryFile | null) => void;
  onError?: (message: string) => void;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  type,
  value,
  onChange,
  onError,
  className = '',
  disabled = false,
}: FileUploadProps) {
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setProgress(0);
      onError?.('');
      try {
        const uploadFn =
          type === 'resume'
            ? api.upload.resume
            : type === 'document'
              ? api.upload.document
              : api.upload.profilePhoto;
        const res = await uploadFn(file, (p) => setProgress(p));
        const apiRes = res.data;
        if (apiRes.success && apiRes.data) {
          onChange({
            url: apiRes.data.url,
            publicId: apiRes.data.publicId,
            secureUrl: apiRes.data.url, // fallback
          });
        } else {
          onError?.('Upload failed');
        }
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : 'Upload failed';
        onError?.(msg ?? 'Upload failed');
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [type, onChange, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      if (disabled || uploading) return;
      const file = e.dataTransfer.files[0];
      if (file) upload(file);
    },
    [disabled, uploading, upload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || uploading) return;
      const file = e.target.files?.[0];
      if (file) upload(file);
      e.target.value = '';
    },
    [disabled, uploading, upload]
  );

  const handleRemove = useCallback(() => {
    if (value?.publicId && !uploading) {
      api.upload
        .delete(value.publicId, value.resourceType ?? 'image')
        .catch(() => { });
    }
    onChange(null);
  }, [value, uploading, onChange]);

  const isImage = type === 'profile' || (value?.url && /\.(jpe?g|png|webp|gif)/i.test(value.url));

  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-xl border-2 border-dashed transition-colors ${drag ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)]'
          } ${disabled || uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
      >
        <input
          type="file"
          accept={ACCEPT[type]}
          onChange={handleChange}
          disabled={disabled || uploading}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          aria-label={`Upload ${LABEL[type]}`}
        />
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
          {uploading ? (
            <>
              <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-[var(--border)]">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">Uploading… {progress}%</p>
            </>
          ) : value ? (
            <>
              {/* Preview */}
              <div className="flex flex-col items-center gap-2">
                {isImage ? (
                  <img
                    src={value.url}
                    alt="Preview"
                    className="h-24 w-24 rounded-lg object-cover ring-2 ring-[var(--border)]"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-[var(--border)]/50">
                    <svg
                      className="h-10 w-10 text-[var(--muted-foreground)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
                <p className="max-w-[200px] truncate text-sm text-[var(--muted-foreground)]">
                  Uploaded
                </p>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove();
                    }}
                    className="text-sm text-[var(--primary)] hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <svg
                className="h-12 w-12 text-[var(--muted-foreground)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">{LABEL[type]}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
