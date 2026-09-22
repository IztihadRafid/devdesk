

const requestLog = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const timestamps = requestLog.get(key) || [];

  
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxRequests) {
    const oldestInWindow = recent[0];
    const retryAfterSeconds = Math.ceil((windowMs - (now - oldestInWindow)) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  recent.push(now);
  requestLog.set(key, recent);
  return { allowed: true };
}