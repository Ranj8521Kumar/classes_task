import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { buildFallbackSolution } from "../src/fallback.js";
import { parseGeminiPayload } from "../src/gemini.js";
import type { SolveResponse } from "../src/types.js";

const solved: SolveResponse = {
  questionTitle: "Linear equations",
  breakdown: ["Identify the variable.", "Move constants to the other side."],
  briefAnswer: "Solve by keeping both sides balanced.",
  steps: ["Subtract 5 from both sides.", "Divide both sides by 2."],
  finalAnswer: "x = 4",
  commonMistake: "Do not change one side without doing the same to the other.",
  practiceQuestion: {
    question: "Solve 3x + 6 = 18.",
    hint: "Remove 6 first.",
    answer: "x = 4"
  },
  confidenceNote: "Check by substituting the value back into the original equation."
};

describe("DoubtDesk API", () => {
  it("returns a structured Gemini-style solution for a valid doubt", async () => {
    const app = createApp({
      solver: async () => solved
    });

    const response = await request(app).post("/api/solve-doubt").send({
      grade: "8",
      subject: "Math",
      mode: "step-by-step",
      language: "English",
      question: "How do I solve 2x + 5 = 13?"
    });

    expect(response.status).toBe(200);
    expect(response.body.finalAnswer).toBe("x = 4");
    expect(response.body.steps).toHaveLength(2);
    expect(response.body.practiceQuestion.question).toContain("3x");
  });

  it("rejects missing or too-short questions with a 400", async () => {
    const app = createApp({
      solver: async () => solved
    });

    const response = await request(app).post("/api/solve-doubt").send({
      grade: "8",
      subject: "Math",
      mode: "step-by-step",
      question: "why"
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid request");
  });

  it("turns invalid Gemini JSON into a controlled parse error", () => {
    expect(() => parseGeminiPayload("This is not JSON")).toThrow(
      "Gemini returned a response that could not be parsed."
    );
  });

  it("can produce a useful science fallback when Gemini is unavailable", () => {
    const solution = buildFallbackSolution({
      grade: "8",
      subject: "Science",
      mode: "step-by-step",
      language: "English",
      question: "Why does resistance increase when the length of a wire increases?"
    });

    expect(solution.finalAnswer).toContain("R = rho L / A");
    expect(solution.steps.length).toBeGreaterThanOrEqual(3);
  });
});
