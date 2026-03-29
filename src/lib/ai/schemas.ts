export interface AIAnalysisOutput {
  fit_score: number
  confidence_score: number
  company_summary: string
  pain_points: string[]
  ai_use_cases: string[]
  recommended_owners: string[]
  best_outreach_angle: string
  fit_reasons: string
  gap_reasons: string
  reason_not_fit: string | null
}

export function validateAIOutput(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return "Response is not an object"
  const r = raw as Record<string, unknown>

  if (typeof r.fit_score !== "number" || r.fit_score < 0 || r.fit_score > 100) {
    return "fit_score must be a number 0-100"
  }
  if (typeof r.confidence_score !== "number" || r.confidence_score < 0 || r.confidence_score > 1) {
    return "confidence_score must be a number 0.0-1.0"
  }
  if (typeof r.company_summary !== "string" || !r.company_summary) {
    return "company_summary must be a non-empty string"
  }
  if (!Array.isArray(r.pain_points) || !r.pain_points.every((p) => typeof p === "string")) {
    return "pain_points must be a string array"
  }
  if (!Array.isArray(r.ai_use_cases) || !r.ai_use_cases.every((u) => typeof u === "string")) {
    return "ai_use_cases must be a string array"
  }
  if (!Array.isArray(r.recommended_owners) || !r.recommended_owners.every((o) => typeof o === "string")) {
    return "recommended_owners must be a string array"
  }
  if (typeof r.best_outreach_angle !== "string") {
    return "best_outreach_angle must be a string"
  }
  if (typeof r.fit_reasons !== "string") {
    return "fit_reasons must be a string"
  }
  if (typeof r.gap_reasons !== "string") {
    return "gap_reasons must be a string"
  }
  if (r.reason_not_fit !== null && typeof r.reason_not_fit !== "string") {
    return "reason_not_fit must be a string or null"
  }

  return null
}

export const AI_RESPONSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    fit_score: {
      type: "integer",
      description: "Fit score 0-100. >70 = strong fit, 50-70 = possible, <50 = weak",
    },
    confidence_score: {
      type: "number",
      description: "Confidence 0.0-1.0 in the analysis based on content quality",
    },
    company_summary: {
      type: "string",
      description: "2-3 sentence factual summary of what the company does",
    },
    pain_points: {
      type: "array",
      items: { type: "string" },
      description: "3-5 likely operational pain points this company faces",
    },
    ai_use_cases: {
      type: "array",
      items: { type: "string" },
      description: "3-5 specific AI automation use cases Brancr Labs could offer",
    },
    recommended_owners: {
      type: "array",
      items: { type: "string" },
      description: "2-5 likely roles or teams inside the company that should own, approve, review, or benefit from the workflow change",
    },
    best_outreach_angle: {
      type: "string",
      description: "One sentence: the strongest angle to lead with in outreach",
    },
    fit_reasons: {
      type: "string",
      description: "Explain why the company is a good fit for Brancr Labs",
    },
    gap_reasons: {
      type: "string",
      description: "Explain any gaps, blockers, or reasons it is not a perfect fit",
    },
    reason_not_fit: {
      type: ["string", "null"],
      description: "If fit_score < 50 explain why; otherwise null",
    },
  },
  required: [
    "fit_score",
    "confidence_score",
    "company_summary",
    "pain_points",
    "ai_use_cases",
    "recommended_owners",
    "best_outreach_angle",
    "fit_reasons",
    "gap_reasons",
    "reason_not_fit",
  ],
  additionalProperties: false,
} as const
