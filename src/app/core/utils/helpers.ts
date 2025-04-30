export function deduplicateBy<T, K extends keyof T>(items: T[], key: K = '_id' as K): T[] {
  const map = new Map<T[K], T>();
  for (const item of items) {
    const k = item?.[key];
    if (k !== undefined && k !== null) {
      map.set(k, item);
    }
  }
  return Array.from(map.values());
}
