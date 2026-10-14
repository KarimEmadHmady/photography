// src/lib/logger.ts
export const logger = {
  log: (...args: any[]) => console.log('[LOG]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
};
