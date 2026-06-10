import { useState, useRef } from 'react';
import { Camera, Loader2, Trash2, Upload, Check } from 'lucide-react';
import { compressImage, formatBytes } from '../lib/imageCompress';

const MAX_INPUT_BYTES = 12 * 1024 * 1024; // 12 MB — server will compress anyway
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export default function PassportUpload({ value, onChange, required = false, disabled = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Only image files are accepted (JPG, PNG, WebP, HEIC).');
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError(`File is ${formatBytes(file.size)} — please pick an image under 12 MB.`);
      return;
    }
    setBusy(true);
    try {
      const result = await compressImage(file);
      onChange({
        passportPhoto: result.base64,
        passportMime: result.mime,
        passportSizeBytes: result.sizeBytes,
        passportWidth: result.width,
        passportHeight: result.height,
        passportFileName: result.file.name,
      });
    } catch (err) {
      console.error(err);
      setError('Could not process this image. Try a different file.');
    } finally {
      setBusy(false);
    }
  };

  const onPick = (event) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = '';
  };

  const onDrop = (event) => {
    event.preventDefault();
    if (disabled || busy) return;
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    onChange(null);
    setError('');
  };

  return (
    <div>
      <span className="field-label">
        Passport photograph {required ? <span className="text-[var(--err)]">*</span> : null}
      </span>

      {value?.passportPhoto ? (
        <div className="surface-soft relative overflow-hidden p-3">
          <div className="flex items-center gap-3">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--line-strong)] bg-black">
              <img
                src={value.passportPhoto}
                alt="Passport preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute right-0.5 top-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ok)] text-white">
                <Check className="h-3 w-3" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text)]">
                {value.passportFileName || 'Passport attached'}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-2)]">
                {value.passportMime?.replace('image/', '').toUpperCase()} · {formatBytes(value.passportSizeBytes)} · {value.passportWidth}×{value.passportHeight}
              </p>
              <p className="mt-1 text-[11px] text-[var(--muted)]">Compressed in your browser before upload.</p>
            </div>
            <button
              type="button"
              onClick={clear}
              disabled={disabled}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-[var(--err)] hover:text-[var(--err)]"
              aria-label="Remove photo"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--line-strong)] bg-[rgba(12,6,8,0.4)] px-4 py-6 text-center transition hover:border-[var(--accent)] hover:bg-[rgba(224,178,90,0.04)] ${
            busy ? 'pointer-events-none opacity-70' : ''
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            onChange={onPick}
            disabled={disabled || busy}
            className="sr-only"
          />
          {busy ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin text-[var(--accent)]" />
              <p className="text-sm font-semibold text-[var(--text)]">Compressing image…</p>
              <p className="text-[11px] text-[var(--muted)]">Converting to WebP and resizing</p>
            </>
          ) : (
            <>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-[rgba(224,178,90,0.06)] text-[var(--accent)]">
                <Camera className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-[var(--text)]">Tap to attach a passport photo</p>
              <p className="text-[11px] text-[var(--muted)]">
                JPG, PNG or WebP · auto-compressed to ~200 KB WebP
              </p>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                <Upload className="h-3 w-3" />
                Browse / camera
              </span>
            </>
          )}
        </label>
      )}

      {error ? <p className="mt-2 text-xs text-[var(--err)]">{error}</p> : null}
    </div>
  );
}
