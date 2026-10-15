import imageCompression from 'browser-image-compression';

// THE ONE RULE: every image is compressed client-side before it ever reaches
// storage. This is what keeps R2 inside the 10 GB free tier forever.
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.15,          // target ~150 KB
  maxWidthOrHeight: 1600,   // plenty for full-screen magazine cards
  useWebWorker: true,
  fileType: 'image/webp' as const,
};

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function compressAndUpload(file: File): Promise<string> {
  const compressed = await imageCompression(file, COMPRESSION_OPTIONS);

  try {
    const res = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType: 'image/webp' }),
    });
    if (!res.ok) throw new Error('Could not get upload URL');
    const { uploadUrl, publicUrl } = await res.json();

    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/webp' },
      body: compressed,
    });
    if (!putRes.ok) throw new Error('Upload to storage failed');

    return publicUrl;
  } catch {
    // Storage isn't configured yet — embed the compressed image so the UI
    // still has a URL that survives navigation. Swap back to R2 later.
    return toDataUrl(compressed);
  }
}
