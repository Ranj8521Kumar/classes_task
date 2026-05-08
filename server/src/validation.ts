import { z } from "zod";

export const subjects = [
  "Math",
  "Science",
  "English",
  "Social Science",
  "Computer Science",
  "Other"
] as const;

export const answerModes = ["step-by-step", "quick", "exam-style"] as const;

export const solveRequestSchema = z.object({
  grade: z
    .union([z.string(), z.number()])
    .transform(String)
    .pipe(z.enum(["6", "7", "8", "9", "10", "11", "12"])),
  subject: z.enum(subjects),
  mode: z.enum(answerModes).default("step-by-step"),
  language: z.string().trim().min(2).max(32).default("English"),
  question: z.string().trim().min(8).max(2500)
});

export const solveResponseSchema = z.object({
  questionTitle: z.string().trim().min(3).max(90),
  breakdown: z.array(z.string().trim().min(3)).min(2).max(5),
  briefAnswer: z.string().trim().min(8).max(500),
  steps: z.array(z.string().trim().min(5)).min(2).max(8),
  finalAnswer: z.string().trim().min(1).max(600),
  commonMistake: z.string().trim().min(8).max(400),
  practiceQuestion: z.object({
    question: z.string().trim().min(5).max(400),
    hint: z.string().trim().min(3).max(250),
    answer: z.string().trim().min(1).max(300)
  }),
  confidenceNote: z.string().trim().min(8).max(300)
});
