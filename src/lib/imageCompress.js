/* ---------------------------------------------------------------------------
   Client-side image compression for passport photos.
   - Reads the file into an Image, draws it to a Canvas.
   - Resizes to a max dimension (preserves aspect ratio).
   - Tries WebP first, falls back to JPEG if WebP is unsupported.
   - Returns a File with the right mime/extension and a compressed payload.
   --------------------------------------------------------------------------- */

const MAX_DIMENSION = 1024;          // Passport-sized; no need to exceed
const WEBP_QUALITY = 0.85;
const JPEG_QUALITY = 0.85;
const TARGET_BYTES = 200 * 1024;     // Aim for ≤ 200 KB final

const supportsWebP = () => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const data = canvas.toDataURL('image/webp');
  return data.startsWith('data:image/webp');
};

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });

const drawToCanvas = (img, maxDim) => {
  const { width, height } = img;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
};

const canvasToBlob = (canvas, mime, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Canvas export failed'));
        else resolve(blob);
      },
      mime,
      quality
    );
  });

const blobToFile = (blob, name) => {
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const safeName = name.replace(/\.[^.]+$/, '') + '.' + ext;
  return new File([blob], safeName, { type: blob.type, lastModified: Date.now() });
};

/**
 * Compress an image File to WebP (preferred) or JPEG fallback.
 * Returns { file, base64, mime, sizeBytes, width, height }.
 */
export const compressImage = async (file, { maxDimension = MAX_DIMENSION } = {}) => {
  if (!file) throw new Error('No file provided');
  if (!file.type.startsWith('image/')) throw new Error('Not an image file');

  const img = await loadImage(file);
  const canvas = drawToCanvas(img, maxDimension);

  const mime = supportsWebP() ? 'image/webp' : 'image/jpeg';
  const quality = mime === 'image/webp' ? WEBP_QUALITY : JPEG_QUALITY;
  let blob = await canvasToBlob(canvas, mime, quality);

  // If still over target, try a lower quality pass (only meaningful for lossy formats)
  if (blob.size > TARGET_BYTES && (mime === 'image/webp' || mime === 'image/jpeg')) {
    const lower = mime === 'image/webp' ? 0.7 : 0.7;
    blob = await canvasToBlob(canvas, mime, lower);
  }

  const compressedFile = blobToFile(blob, file.name);
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  return {
    file: compressedFile,
    base64,
    mime,
    sizeBytes: blob.size,
    width: canvas.width,
    height: canvas.height,
  };
};

export const formatBytes = (n) => {
  if (!n && n !== 0) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
};
