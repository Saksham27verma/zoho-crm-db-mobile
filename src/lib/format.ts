export function isIsoDateString(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}([T ][\d:.]+)?(Z|[+-]\d{2}:\d{2})?$/.test(value)
  );
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return new Intl.NumberFormat().format(value);
  if (value instanceof Date) return value.toLocaleString();
  if (isIsoDateString(value)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toLocaleString();
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function formatDateOnly(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const d =
    value instanceof Date ? value : isIsoDateString(value) ? new Date(value as string) : null;
  if (d && !Number.isNaN(d.getTime())) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return String(value);
}

export function findKey<T extends Record<string, unknown>>(
  obj: T,
  keys: string[],
): keyof T | undefined {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const k of keys) {
    if (k in obj) return k as keyof T;
  }
  const wanted = new Set(keys.map(normalize));
  for (const existing of Object.keys(obj)) {
    if (wanted.has(normalize(existing))) return existing as keyof T;
  }
  return undefined;
}

export function pickFirst<T extends Record<string, unknown>>(
  obj: T,
  keys: string[],
): unknown {
  const k = findKey(obj, keys);
  if (!k) return undefined;
  const v = obj[k];
  return v === "" ? undefined : v;
}
