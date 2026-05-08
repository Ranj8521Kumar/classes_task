export type Subject =
  | "Math"
  | "Science"
  | "English"
  | "Social Science"
  | "Computer Science"
  | "Other";

export type AnswerMode = "step-by-step" | "quick" | "exam-style";

export interface SolveRequest {
  grade: string;
  subject: Subject;
  mode: AnswerMode;
  language: string;
  question: string;
}

export interface PracticeQuestion {
  question: string;
  hint: string;
  answer: string;
}

export interface SolveResponse {
  questionTitle: string;
  breakdown: string[];
  briefAnswer: string;
  steps: string[];
  finalAnswer: string;
  commonMistake: string;
  practiceQuestion: PracticeQuestion;
  confidenceNote: string;
}

export type DoubtSolver = (request: SolveRequest) => Promise<SolveResponse>;
