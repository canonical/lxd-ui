export const mapsAreEqual = <K, V>(a: Map<K, V>, b: Map<K, V>): boolean => {
  if (a.size !== b.size) return false;

  for (const [key, valA] of a) {
    if (!b.has(key)) return false;
    const valB = b.get(key);
    if (valA !== valB) return false;
  }

  return true;
};
