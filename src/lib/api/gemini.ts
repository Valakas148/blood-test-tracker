import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import { BIOMARKER_EXTRACTION_PROMPT } from './prompts'
import { Biomarker } from '@/types'
import { getBiomarkerStatus } from '@/lib/validators/biomarker.validator'

const rawBiomarkerSchema = z.object({
  name: z.string().trim().min(1),
  value: z.coerce.number(),
  unit: z.string().trim().min(1),
  referenceRange: z.object({
    min: z.coerce.number(),
    max: z.coerce.number(),
  }),
})

const rawBiomarkerArraySchema = z.array(rawBiomarkerSchema)

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1200

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isTransientGeminiError(error: unknown) {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return (
    message.includes('503') ||
    message.includes('service unavailable') ||
    message.includes('resource exhausted') ||
    message.includes('429')
  )
}

function extractJsonArrayText(text: string) {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim()
  const start = cleaned.indexOf('[')
  const end = cleaned.lastIndexOf(']')
  if (start === -1 || end === -1 || end < start) {
    throw new Error('GEMINI_INVALID_RESPONSE_FORMAT')
  }
  return cleaned.slice(start, end + 1)
}

export async function extractBiomarkersFromFile(
  fileBuffer: ArrayBuffer,
  mimeType: string
): Promise<Biomarker[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const base64 = Buffer.from(fileBuffer).toString('base64')

  let result: Awaited<ReturnType<typeof model.generateContent>> | null = null
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      result = await model.generateContent([
        BIOMARKER_EXTRACTION_PROMPT,
        {
          inlineData: {
            mimeType,
            data: base64,
          },
        },
      ])
      break
    } catch (error) {
      lastError = error
      if (!isTransientGeminiError(error) || attempt === MAX_RETRIES) {
        break
      }
      await sleep(RETRY_DELAY_MS * attempt)
    }
  }

  if (!result) {
    if (isTransientGeminiError(lastError)) {
      throw new Error('GEMINI_TEMPORARILY_UNAVAILABLE')
    }
    throw lastError instanceof Error ? lastError : new Error('GEMINI_REQUEST_FAILED')
  }

  const text = result.response.text().trim()
  const jsonPayload = extractJsonArrayText(text)
  const parsed = JSON.parse(jsonPayload)
  const validation = rawBiomarkerArraySchema.safeParse(parsed)
  if (!validation.success) {
    throw new Error('GEMINI_INVALID_RESPONSE_FORMAT')
  }

  return validation.data.map((item) => ({
    id: crypto.randomUUID(),
    name: item.name,
    value: item.value,
    unit: item.unit,
    referenceRange: {
      min: item.referenceRange.min,
      max: item.referenceRange.max,
    },
    status: getBiomarkerStatus(item.value, {
      min: item.referenceRange.min,
      max: item.referenceRange.max,
    }),
  }))
}