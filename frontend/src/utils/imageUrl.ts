// Same-origin by default -- see axiosInstance.ts for why.
const API_URL = import.meta.env['VITE_API_URL'] ?? '';

/** Resolves stored upload paths and legacy bare event filenames. */
export function fileUrl(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${API_URL}${value.startsWith('/') ? value : `/uploads/events/${value}`}`;
}
