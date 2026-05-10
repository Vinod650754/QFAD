export const startOfUtcDay = (date = new Date()) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

export const endOfUtcDay = (date = new Date()) => {
  const start = startOfUtcDay(date);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
};

export const isYesterdayUtc = (candidate, now = new Date()) => {
  if (!candidate) return false;
  const yesterday = new Date(startOfUtcDay(now).getTime() - 24 * 60 * 60 * 1000);
  return startOfUtcDay(candidate).getTime() === yesterday.getTime();
};
