/**
 * Shared input validation and domain utilities.
 */

/** Extract and normalise a domain from a URL string. Returns null on failure. */
export function normalizeDomain(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`)
    return parsed.hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return null
  }
}

/** Validate that a URL is well-formed. Returns error string or null. */
export function validateUrl(url: string): string | null {
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`)
    return null
  } catch {
    return "Invalid URL format"
  }
}

/** Validate required string fields. Returns map of field → error. */
export function validateRequired(
  data: Record<string, string | undefined | null>,
  required: string[]
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of required) {
    if (!data[field]?.trim()) {
      errors[field] = `${field} is required`
    }
  }
  return errors
}
