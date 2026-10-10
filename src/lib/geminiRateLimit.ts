/**
 * Client-side rate limit tracking for Gemini API
 * Stores usage in localStorage. Free tier: 15 RPM, 1500 RPD.
 */

const STORAGE_KEY = 'wassup_gemini_usage';
const RPM_LIMIT = 15;
const RPD_LIMIT = 1500;

interface UsageRecord {
  timestamps: number[];   // millisecond timestamps of requests
  dailyCount: number;     // total requests today
  date: string;           // "YYYY-MM-DD" of the daily count
}

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function loadUsage(): UsageRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Reset daily count if date changed
      if (parsed.date !== todayKey()) {
        return { timestamps: [], dailyCount: 0, date: todayKey() };
      }
      return parsed;
    }
  } catch {}
  return { timestamps: [], dailyCount: 0, date: todayKey() };
}

function saveUsage(record: UsageRecord): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

/** Check if a Gemini request can be made right now */
export function canUseGemini(): { allowed: boolean; reason?: string } {
  const usage = loadUsage();
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;

  // Clean old timestamps (older than 1 minute)
  const recentTimestamps = usage.timestamps.filter(ts => ts > oneMinuteAgo);

  if (recentTimestamps.length >= RPM_LIMIT) {
    return { allowed: false, reason: 'Rate limit: 15 requests per minute reached. Wait a moment or use the free decoder.' };
  }

  if (usage.dailyCount >= RPD_LIMIT) {
    return { allowed: false, reason: 'Daily limit: 1,500 requests reached. Try again tomorrow or use the free decoder.' };
  }

  return { allowed: true };
}

/** Check if we can use Gemini for a disambiguation step (reserve a few slots) */
export function canDisambiguate(): { allowed: boolean; reason?: string } {
  const usage = loadUsage();
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;
  const recentTimestamps = usage.timestamps.filter(ts => ts > oneMinuteAgo);
  // Reserve 2 slots per minute for disambiguation
  if (recentTimestamps.length >= RPM_LIMIT - 2) {
    return { allowed: false, reason: 'Gemini disambiguation rate limit reached' };
  }
  if (usage.dailyCount >= RPD_LIMIT) {
    return { allowed: false, reason: 'Daily limit reached' };
  }
  return { allowed: true };
}

/** Record a successful Gemini API call */
export function recordUsage(): void {
  const usage = loadUsage();
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;

  // Clean old timestamps
  const recentTimestamps = usage.timestamps.filter(ts => ts > oneMinuteAgo);
  recentTimestamps.push(now);

  usage.timestamps = recentTimestamps;
  usage.dailyCount += 1;
  usage.date = todayKey();

  saveUsage(usage);
}

/** Get current usage stats for display */
export function getUsage(): { minuteUsed: number; minuteLimit: number; dayUsed: number; dayLimit: number } {
  const usage = loadUsage();
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;

  const minuteUsed = usage.timestamps.filter(ts => ts > oneMinuteAgo).length;
  const dayUsed = usage.date === todayKey() ? usage.dailyCount : 0;

  return {
    minuteUsed,
    minuteLimit: RPM_LIMIT,
    dayUsed,
    dayLimit: RPD_LIMIT,
  };
}

/** Reset all usage data */
export function resetUsage(): void {
  localStorage.removeItem(STORAGE_KEY);
}
