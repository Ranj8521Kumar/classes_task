import { GoogleGenAI, Type } from "@google/genai";

import { buildFallbackSolution } from "./fallback.js";
import type { SolveRequest, SolveResponse } from "./types.js";
import { solveResponseSchema } from "./validation.js";

const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    questionTitle: { type: Type.STRING },
    breakdown: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    briefAnswer: { type: Type.STRING },
    steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    finalAnswer: { type: Type.STRING },
    commonMistake: { type: Type.STRING },
    practiceQuestion: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        hint: { type: Type.STRING },
        answer: { type: Type.STRING }
      },
      required: ["question", "hint", "answer"]
    },
    confidenceNote: { type: Type.STRING }
  },
  required: [
    "questionTitle",
    "breakdown",
    "briefAnswer",
    "steps",
    "finalAnswer",
    "commonMistake",
    "practiceQuestion",
    "confidenceNote"
  ],
  propertyOrdering: [
    "questionTitle",
    "breakdown",
    "briefAnswer",
    "steps",
    "finalAnswer",
    "commonMistake",
    "practiceQuestion",
    "confidenceNote"
  ]
};

export class SolverError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 502
  ) {
    super(message);
  }
}

export function parseGeminiPayload(raw: string): SolveResponse {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new SolverError("Gemini returned a response that could not be parsed.");
  }

  const result = solveResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new SolverError("Gemini returned an incomplete response.");
  }

  return result.data;
}

function buildPrompt(input: SolveRequest): string {
  return [
    `Student class: ${input.grade}`,
    `Subject: ${input.subject}`,
    `Preferred answer mode: ${input.mode}`,
    `Preferred language: ${input.language}`,
    "",
    "Doubt/question:",
    input.question,
    "",
    "Create a helpful school-level explanation. Keep the tone encouraging, direct, and age-appropriate.",
    "For Math/Science, show reasoning and units where relevant. For English/Social Science, explain concepts with examples.",
    "Do not invent textbook page numbers or claim certainty where the student's question is ambiguous."
  ].join("\n");
}

export async function solveWithGemini(input: SolveRequest): Promise<SolveResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return buildFallbackSolution(input);
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models
    .generateContent({
      model,
      contents: buildPrompt(input),
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.35,
        systemInstruction:
          "You are DoubtDesk, a careful tutor for Indian school students in Classes 6 to 12. Return only valid JSON matching the schema."
      }
    })
    .catch(() => null);

  if (!response) {
    return buildFallbackSolution(input);
  }

  const text = response.text;
  if (!text) {
    throw new SolverError("Gemini returned an empty response.");
  }

  return parseGeminiPayload(text);
}
