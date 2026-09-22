/**
 * Server-side input validation.
 *
 * Every value that reaches the database, a payment provider, or an email is
 * re-validated here, on the server, no matter what the browser claims. Client
 * checks exist only to give quick feedback.
 */

/** Raised for any rejected input; mapped to HTTP 400 by `apiFailure`. */
export class ValidationError extends Error {
  readonly status = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

type TextOptions = { field: string; min?: number; max: number };

/** Required, trimmed, length-bounded text. Control characters are rejected. */
export function requiredText(value: unknown, { field, min = 1, max }: TextOptions): string {
  if (typeof value !== "string") throw new ValidationError(`${field} is required.`);
  const cleaned = value.trim();
  if (cleaned.length < min) throw new ValidationError(`${field} is required.`);
  if (cleaned.length > max) throw new ValidationError(`${field} must be ${max} characters or fewer.`);
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(cleaned)) {
    throw new ValidationError(`${field} contains invalid characters.`);
  }
  return cleaned;
}

/** Optional text: missing/empty becomes `fallback`, otherwise it is bounded. */
export function optionalText(
  value: unknown,
  { field, max, fallback = "" }: TextOptions & { fallback?: string }
): string {
  if (value === undefined || value === null || value === "") return fallback;
  return requiredText(value, { field, min: 1, max });
}

const EMAIL_PATTERN = /^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i;

export function emailValue(value: unknown, { field = "Email" }: { field?: string } = {}): string {
  const cleaned = requiredText(value, { field, max: 254 }).toLowerCase();
  if (!EMAIL_PATTERN.test(cleaned)) throw new ValidationError(`${field} is not a valid email address.`);
  return cleaned;
}

const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,17}[0-9]$/;

export function phoneValue(value: unknown, { field = "Phone number" }: { field?: string } = {}): string {
  const cleaned = requiredText(value, { field, max: 20 });
  if (!PHONE_PATTERN.test(cleaned)) throw new ValidationError(`${field} is not valid.`);
  return cleaned;
}

/**
 * Money, always normalised to a 2-decimal string for the `numeric(10,2)`
 * columns. Rejects NaN, negatives, and anything above the column's range so a
 * tampered request can never write a price or total we did not compute.
 */
export function moneyValue(
  value: unknown,
  { field = "Price", max = 9_999_999.99 }: { field?: string; max?: number } = {}
): string {
  const parsed = typeof value === "string" ? Number(value.trim()) : typeof value === "number" ? value : Number.NaN;
  if (typeof value === "boolean" || !Number.isFinite(parsed)) {
    throw new ValidationError(`${field} must be a number.`);
  }
  if (parsed < 0) throw new ValidationError(`${field} cannot be negative.`);
  if (parsed > max) throw new ValidationError(`${field} is too large.`);
  return parsed.toFixed(2);
}

type IntOptions = { field: string; min?: number; max?: number };

export function intValue(value: unknown, { field, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER }: IntOptions): number {
  const parsed = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isInteger(parsed)) {
    throw new ValidationError(`${field} must be a whole number.`);
  }
  if (parsed < min || parsed > max) throw new ValidationError(`${field} is out of range.`);
  return parsed;
}

export function oneOf<T extends string>(value: unknown, allowed: readonly T[], field: string): T {
  if (typeof value === "string" && (allowed as readonly string[]).includes(value)) {
    return value as T;
  }
  throw new ValidationError(`${field} must be one of: ${allowed.join(", ")}.`);
}

/**
 * HTTPS-only image URL, optionally restricted to hosts we control. This blocks
 * `javascript:`/`data:` URLs and third-party tracking pixels from being stored
 * and then rendered straight into an `<img src>` or `<a href>`.
 */
export function httpsUrl(
  value: unknown,
  { field = "Image", allowedHosts }: { field?: string; allowedHosts?: readonly string[] } = {}
): string {
  if (typeof value !== "string") throw new ValidationError(`${field} must be a URL.`);
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new ValidationError(`${field} must be a full URL.`);
  }
  if (url.protocol !== "https:") throw new ValidationError(`${field} must use HTTPS.`);
  if (allowedHosts?.length && !allowedHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) {
    throw new ValidationError(`${field} must be hosted on an approved domain.`);
  }
  return url.toString();
}

/** Rejects unexpected keys so mass-assignment cannot smuggle in `role`/`isAdmin`. */
export function rejectUnknownKeys(body: Record<string, unknown>, allowed: readonly string[]): void {
  const extra = Object.keys(body).filter((key) => !allowed.includes(key));
  if (extra.length) throw new ValidationError(`Unexpected field${extra.length > 1 ? "s" : ""}: ${extra.join(", ")}.`);
}

const DEFAULT_BODY_LIMIT = 64 * 1024;

/**
 * Reads a JSON body with a hard size cap, so a huge payload cannot exhaust
 * memory before validation ever runs.
 */
export async function readJsonBody(
  request: Request,
  { maxBytes = DEFAULT_BODY_LIMIT }: { maxBytes?: number } = {}
): Promise<Record<string, unknown>> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new ValidationError("The request is too large.");
  }
  const text = await request.text();
  if (text.length > maxBytes) throw new ValidationError("The request is too large.");
  if (!text.trim()) throw new ValidationError("A JSON body is required.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ValidationError("The request body must be valid JSON.");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new ValidationError("The request body must be a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

/**
 * Password policy. 72 bytes is bcrypt's real ceiling: anything longer is
 * silently truncated by the hash, so it is rejected here instead.
 */
export function assertPasswordPolicy(password: unknown, { field = "Password" }: { field?: string } = {}): string {
  if (typeof password !== "string") throw new ValidationError(`${field} is required.`);
  if (password.length < 8) throw new ValidationError(`${field} must be at least 8 characters.`);
  if (Buffer.byteLength(password, "utf8") > 72) throw new ValidationError(`${field} is too long.`);
  if (/^(.)\1+$/.test(password)) throw new ValidationError(`${field} is too easy to guess.`);
  return password;
}
