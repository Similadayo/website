import OpenAI from "openai"
import { db } from "@/lib/db"
import { AI_RESPONSE_JSON_SCHEMA, AIAnalysisOutput, validateAIOutput } from "./schemas"
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts"

let _openai: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set. Add it to your .env file.")
  }
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _openai
}

export async function runAIFitAnalysis(
  leadId: string,
  contextText: string
): Promise<void> {
  const client = getOpenAIClient()

  // Detect low-content situations before calling the API
  const cleanLength = contextText.replace(/\[.*?\]/g, "").trim().length
  const isLowContent = cleanLength < 200

  let fitScore: number
  let confidenceScore: number
  let companySummary: string
  let painPoints: string[]
  let aiUseCases: string[]
  let outreachAngle: string
  let reasonNotFit: string | null
  let rawResponse: string
  let modelName: string

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: buildUserPrompt(contextText) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name:   "ai_analysis",
          strict: true,
          schema: AI_RESPONSE_JSON_SCHEMA,
        },
      },
      temperature: 0.3, // lower temp for consistent structured output
      max_tokens: 1000,
    })

    rawResponse = response.choices[0]?.message?.content ?? ""
    modelName   = response.model

    if (!rawResponse) {
      throw new Error("OpenAI returned an empty response")
    }

    const parsed = JSON.parse(rawResponse) as unknown
    const validationError = validateAIOutput(parsed)
    if (validationError) {
      throw new Error(`AI response failed validation: ${validationError}`)
    }
    const data = parsed as AIAnalysisOutput

    fitScore        = data.fit_score
    confidenceScore = isLowContent
      ? Math.min(data.confidence_score, 0.4)
      : data.confidence_score
    companySummary  = data.company_summary
    painPoints      = data.pain_points
    aiUseCases      = data.ai_use_cases
    outreachAngle   = data.best_outreach_angle
    reasonNotFit    = data.reason_not_fit
    const fitReasons = data.fit_reasons
    const gapReasons = data.gap_reasons

    // Persist successful analysis
    await db.aIAnalysis.create({
      data: {
        leadId,
        fitScore,
        confidenceScore,
        companySummary,
        painPoints:    JSON.stringify(painPoints),
        useCases:      JSON.stringify(aiUseCases),
        fitReasons,
        gapReasons,
        outreachAngle,
        rawResponse,
        modelName,
      },
    })
  } catch (err: any) {
    // Store the failure record
    await db.aIAnalysis.create({
      data: {
        leadId,
        fitScore:        null,
        confidenceScore: null,
        companySummary:  `Analysis failed: ${err.message}`,
        painPoints:      JSON.stringify([]),
        useCases:        JSON.stringify([]),
        outreachAngle:   null,
        rawResponse:     JSON.stringify({ error: err.message }),
        modelName:       "error",
      },
    })
    throw err
  }

  // Update lead stage
  await db.lead.update({
    where: { id: leadId },
    data: { stage: "analyzed" },
  })
}
