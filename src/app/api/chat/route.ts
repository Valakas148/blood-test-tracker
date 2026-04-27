import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";
import type { BloodTest } from "@/types";

const biomarkerSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  referenceRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
  status: z.enum(["normal", "low", "high"]),
});

const bloodTestSchema = z.object({
  id: z.string(),
  date: z.string(),
  source: z.enum(["pdf", "image", "csv", "manual"]),
  fileName: z.string().optional(),
  biomarkers: z.array(biomarkerSchema),
  notes: z.string().optional(),
  createdAt: z.number(),
});

const uiMessageSchema = z
  .object({
    id: z.string().optional(),
    role: z.enum(["system", "user", "assistant", "tool"]),
    parts: z.array(z.object({ type: z.string() }).passthrough()).optional(),
    content: z.unknown().optional(),
  })
  .passthrough();

const chatRequestSchema = z.object({
  messages: z.array(uiMessageSchema),
  bloodTests: z.array(bloodTestSchema),
});

function formatTestDate(test: BloodTest) {
  const parsed = new Date(test.date).getTime();
  const timestamp = Number.isFinite(parsed) ? parsed : test.createdAt;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(timestamp));
}

function buildSystemPrompt(tests: BloodTest[]): string {
  if (!tests || tests.length === 0) {
    return `You are a friendly health assistant.
The user has not uploaded any blood tests yet.
Politely let them know they need to upload results first before you can analyze anything.
Keep it short and encouraging.`;
  }

  const formatted = tests.map((test) => ({
    date: formatTestDate(test),
    source: test.source,
    notes: test.notes || null,
    biomarkers: test.biomarkers.map((biomarker) => ({
      name: biomarker.name,
      value: biomarker.value,
      unit: biomarker.unit,
      status: biomarker.status,
      referenceRange: `${biomarker.referenceRange.min} - ${biomarker.referenceRange.max}`,
    })),
  }));

  return `You are a health assistant helping a user understand their blood test results.

User's blood test history (${tests.length} test${tests.length > 1 ? "s" : ""}):
${JSON.stringify(formatted, null, 2)}

Rules:
- Answer ONLY based on the data provided above
- If user asks about a biomarker not in their data, say it wasn't found in their tests
- NEVER diagnose conditions or prescribe treatment
- Always recommend consulting a doctor for medical decisions
- Be concise, friendly, and use plain language (avoid excessive medical jargon)
- When mentioning values, always include the unit and whether it's normal/low/high
- If the user has multiple tests, comment on trends when relevant`;
}

export async function POST(req: NextRequest) {
  const requestBody = await req.json();
  const parsedRequest = chatRequestSchema.safeParse(requestBody);
  if (!parsedRequest.success) {
    return Response.json({ error: "Invalid request payload." }, { status: 400 });
  }
  const { messages, bloodTests } = parsedRequest.data;

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const result = await streamText({
    model: google("gemini-2.5-flash"),
    system: buildSystemPrompt(bloodTests as BloodTest[]),
    messages: await convertToModelMessages(messages as UIMessage[]),
  });

  return result.toUIMessageStreamResponse();
}
