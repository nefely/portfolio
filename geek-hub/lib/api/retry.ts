// AniList — безкоштовний API з лімітом (30–90 запитів/хв на IP) і під
// навантаженням відповідає 429 або 5xx. Повтор із експоненційною затримкою
// прибирає більшість таких збоїв без участі користувача.

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfterMs: number | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isRetryable() {
    return this.status === 429 || this.status >= 500 || this.status === 0;
  }
}

export interface RetryOptions {
  retries: number;
  baseDelayMs: number;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(
  task: () => Promise<T>,
  { retries, baseDelayMs, sleep = defaultSleep }: RetryOptions,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await task();
    } catch (error) {
      const retryable = error instanceof ApiError && error.isRetryable;
      if (!retryable || attempt >= retries) throw error;
      // Retry-After від сервера точніший за наш здогад.
      await sleep(error.retryAfterMs ?? baseDelayMs * 2 ** attempt);
    }
  }
}

export function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds >= 0 ? Math.min(seconds, 10) * 1000 : null;
}
