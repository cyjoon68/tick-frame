export const mergePatch = <T extends Record<string, unknown>>(
  prev: T,
  incoming: Record<string, unknown>,
) => {
  const next = { ...prev };
  for (const key of Object.keys(incoming)) {
    if (incoming[key] === undefined) {
      continue;
    }
    (next as Record<string, unknown>)[key] = incoming[key];
  }
  return next;
};
