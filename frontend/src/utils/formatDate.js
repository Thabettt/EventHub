// Small date formatting utilities used across the UI.
// Provide a named export `formatDateShort` which returns a human-friendly short date.

export function formatDateShort(value) {
  if (!value && value !== 0) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(value) {
  if (!value && value !== 0) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default { formatDateShort, formatDateLong };
