/**
 * Security utilities for input sanitization and injection prevention
 */

/**
 * Sanitizes string input to prevent injection attacks
 */
export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes and control characters except newlines and tabs
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Remove potential script tags and event handlers
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (except for images which are handled separately)
  sanitized = sanitized.replace(/data:(?!image\/)/gi, '');
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized.trim();
}

/**
 * Sanitizes number input to prevent injection
 */
export function sanitizeNumber(input: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  const num = Number(input);
  if (!Number.isFinite(num)) {
    return min;
  }
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitizes email input
 */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  const email = input.trim().toLowerCase();
  // Basic email validation - only allow safe characters
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return '';
  }
  
  return email;
}

/**
 * Sanitizes URL input to prevent protocol injection
 */
export function sanitizeUrl(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  let url = input.trim();
  
  // Only allow http and https protocols
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return '';
  }
  
  try {
    const parsed = new URL(url);
    // Only allow https in production
    if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
      return '';
    }
    return url;
  } catch {
    return '';
  }
}

/**
 * Validates and sanitizes object properties recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  maxDepth = 3,
  currentDepth = 0
): T {
  if (currentDepth >= maxDepth) {
    return obj;
  }
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Sanitize key names
    const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '');
    
    if (typeof value === 'string') {
      sanitized[safeKey] = sanitizeString(value);
    } else if (typeof value === 'number') {
      sanitized[safeKey] = sanitizeNumber(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[safeKey] = sanitizeObject(value as Record<string, unknown>, maxDepth, currentDepth + 1);
    } else if (Array.isArray(value)) {
      sanitized[safeKey] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[safeKey] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Detects potential injection patterns in input
 */
export function detectInjectionPatterns(input: string): boolean {
  const patterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /exec\(/i,
    /system\(/i,
    /require\(/i,
    /import\(/i,
    /\.call\(/i,
    /\.apply\(/i,
    /__proto__/i,
    /constructor\(/i,
    /prototype\[/i,
    /\$\{.*\}/, // Template literal injection
    /<\?php/i,
    /<%/,
    /#\{.*\}/, // Ruby interpolation
  ];
  
  return patterns.some(pattern => pattern.test(input));
}

/**
 * Safe JSON parsing with injection prevention
 */
export function safeJsonParse<T>(input: string, fallback: T): T {
  try {
    // Check for injection patterns before parsing
    if (detectInjectionPatterns(input)) {
      return fallback;
    }
    
    const parsed = JSON.parse(input);
    
    // Sanitize the parsed object
    if (typeof parsed === 'object' && parsed !== null) {
      return sanitizeObject(parsed as Record<string, unknown>) as T;
    }
    
    return parsed as T;
  } catch {
    return fallback;
  }
}