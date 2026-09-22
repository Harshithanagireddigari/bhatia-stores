/**
 * Server-side logging helpers.
 *
 * Rules enforced here (and by every call site that uses them):
 *  - Never log request bodies, cookies, headers, or `process.env`.
 *  - Never log credentials, tokens, OTP codes, payment signatures, or URLs that
 *    can contain a token (password-reset links are the classic example).
 *  - Never send a stack trace or a driver-level message to the client; that
 *    happens in `apiFailure`, which pairs with `logServerError` here.
 */

const REDACTED = "[redacted]";
const MAX_STRING = 200;
const MAX_DEPTH = 4;
const MAX_ARRAY = 20;

/** Keys whose values must never reach a log line. */
const SENSITIVE_KEY =
  /password|passwd|secret|token|otp|code|session|cookie|authorization|credential|signature|api[_-]?key|apikey|private[_-]?key|client[_-]?secret|connectionstring|database[_-]?url|dsn/i;

/** Recursively strips sensitive keys and truncates long strings. */
export function redactSecrets(input: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return REDACTED;
  if (typeof input === "string") {
    return input.length > MAX_STRING ? `${input.slice(0, MAX_STRING)}…` : input;
  }
  if (typeof input !== "object" || input === null) return input;
  if (Array.isArray(input)) {
    return input.slice(0, MAX_ARRAY).map((entry) => redactSecrets(entry, depth + 1));
  }
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    output[key] = SENSITIVE_KEY.test(key) ? REDACTED : redactSecrets(value, depth + 1);
  }
  return output;
}

function truncate(value: string) {
  return value.length > 300 ? `${value.slice(0, 300)}…` : value;
}

/**
 * A short, log-only description of an error. Stack traces are included outside
 * production so developers can debug, and dropped in production where logs are
 * frequently shipped to a shared aggregator.
 */
export function describeError(error: unknown): string {
  if (error instanceof Error) {
    const stack =
      process.env.NODE_ENV === "production" || !error.stack ? "" : `\n${error.stack}`;
    return `${error.name}: ${truncate(error.message)}${stack}`;
  }
  if (typeof error === "string") return truncate(error);
  return "Unknown error";
}

/** Log a failure. `scope` should be `area.action`, e.g. `orders.create`. */
export function logServerError(scope: string, error: unknown): void {
  console.error(`[bhatia][${scope}] ${describeError(error)}`);
}

/** Log a non-fatal event. `meta` is redacted before it is written. */
export function logServerEvent(scope: string, message: string, meta?: Record<string, unknown>): void {
  const suffix = meta ? ` ${JSON.stringify(redactSecrets(meta))}` : "";
  console.info(`[bhatia][${scope}] ${message}${suffix}`);
}

/**
 * Warn about a missing but non-fatal configuration value. Deliberately never
 * echoes the value itself, only whether it is present.
 */
export function logMissingConfig(scope: string, name: string): void {
  console.warn(`[bhatia][${scope}] ${name} is not configured; the related feature is disabled.`);
}
