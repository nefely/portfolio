import { describe, expect, it, vi } from "vitest";
import { ApiError, parseRetryAfter, withRetry } from "./retry";

const noSleep = vi.fn(async () => {});

describe("withRetry", () => {
  it("returns the first successful result", async () => {
    const task = vi.fn().mockResolvedValue("ok");
    await expect(withRetry(task, { retries: 2, baseDelayMs: 100, sleep: noSleep })).resolves.toBe(
      "ok",
    );
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("retries rate limits and server errors with exponential backoff", async () => {
    const sleep = vi.fn(async () => {});
    const task = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("rate limited", 429))
      .mockRejectedValueOnce(new ApiError("down", 503))
      .mockResolvedValue("ok");

    await expect(withRetry(task, { retries: 2, baseDelayMs: 100, sleep })).resolves.toBe("ok");
    expect(sleep.mock.calls).toEqual([[100], [200]]);
  });

  it("honours Retry-After over the computed delay", async () => {
    const sleep = vi.fn(async () => {});
    const task = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("rate limited", 429, 3000))
      .mockResolvedValue("ok");
    await withRetry(task, { retries: 1, baseDelayMs: 100, sleep });
    expect(sleep).toHaveBeenCalledWith(3000);
  });

  it("does not retry 404s", async () => {
    const task = vi.fn().mockRejectedValue(new ApiError("not found", 404));
    await expect(withRetry(task, { retries: 3, baseDelayMs: 1, sleep: noSleep })).rejects.toThrow(
      "not found",
    );
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("gives up after the configured number of retries", async () => {
    const task = vi.fn().mockRejectedValue(new ApiError("down", 500));
    await expect(withRetry(task, { retries: 2, baseDelayMs: 1, sleep: noSleep })).rejects.toThrow(
      "down",
    );
    expect(task).toHaveBeenCalledTimes(3);
  });

  it("does not retry unknown errors", async () => {
    const task = vi.fn().mockRejectedValue(new TypeError("bug"));
    await expect(withRetry(task, { retries: 2, baseDelayMs: 1, sleep: noSleep })).rejects.toThrow(
      "bug",
    );
    expect(task).toHaveBeenCalledTimes(1);
  });
});

describe("parseRetryAfter", () => {
  it("converts seconds to milliseconds and caps at 10s", () => {
    expect(parseRetryAfter("2")).toBe(2000);
    expect(parseRetryAfter("120")).toBe(10_000);
  });

  it("returns null for missing or invalid headers", () => {
    expect(parseRetryAfter(null)).toBeNull();
    expect(parseRetryAfter("soon")).toBeNull();
  });
});
