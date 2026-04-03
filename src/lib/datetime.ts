const TIME_ZONE = "Africa/Lagos"
const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

export function getRelativeDayLabel(value: Date | string | null | undefined) {
  if (!value) return "Unknown date"

  const date = value instanceof Date ? value : new Date(value)
  const currentDateKey = dateKeyFormatter.format(new Date())
  const targetDateKey = dateKeyFormatter.format(date)

  if (targetDateKey === currentDateKey) return "Today"

  return date.toLocaleDateString("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatAdminDate(value: Date | string | null | undefined) {
  if (!value) return "Unknown"

  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleDateString("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatAdminTimestamp(value: Date | string | null | undefined) {
  if (!value) return "Unknown"

  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleString("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
