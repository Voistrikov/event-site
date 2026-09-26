const API_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000';

/** Resolves stored upload paths and legacy bare event filenames. */
export function fileUrl(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${API_URL}${value.startsWith('/') ? value : `/uploads/events/${value}`}`;
}
