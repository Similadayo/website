// Minimal inline icons — no icon library dependency for a content site.
export function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Short arrow used inside metric "before → after" values.
export function MetricArrow() {
  return (
    <svg viewBox="0 0 20 12" fill="none" aria-hidden>
      <path d="M0 6h14M11 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Transform glyph between before / after columns.
export function Transform() {
  return (
    <svg viewBox="0 0 26 26" fill="none" aria-hidden>
      <path d="M4 9h14M14 5l4 4-4 4M22 17H8M12 13l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
