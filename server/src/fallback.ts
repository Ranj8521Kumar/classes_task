import type { SolveRequest, SolveResponse } from "./types.js";

function makeTitle(question: string): string {
  const clean = question.replace(/\s+/g, " ").trim();
  if (clean.length <= 70) return clean.replace(/[?.!]+$/, "");
  return `${clean.slice(0, 67).trim()}...`;
}

function genericSteps(input: SolveRequest): string[] {
  return [
    `First, rewrite the doubt in your own words: ${input.question}`,
    `Mark what is given and what needs to be found for Class ${input.grade} ${input.subject}.`,
    "Connect it to the main rule, formula, definition, or example from the chapter.",
    "Apply that rule one step at a time, then check whether the final answer matches the question."
  ];
}

function scienceResistance(input: SolveRequest): SolveResponse {
  return {
    questionTitle: "Resistance and wire length",
    breakdown: [
      "Resistance tells us how strongly a conductor opposes electric current.",
      "For the same material and thickness, length is the changing factor.",
      "A longer wire gives moving charges a longer path with more collisions."
    ],
    briefAnswer:
      "Resistance increases with wire length because charges travel through more material and face more obstruction.",
    steps: [
      "Use the relation R = rho L / A, where R is resistance, L is length, A is area, and rho depends on material.",
      "If material and thickness stay the same, rho and A are constant.",
      "That leaves R directly proportional to L.",
      "So when length increases, resistance increases in the same ratio."
    ],
    finalAnswer:
      "For a uniform wire, R = rho L / A. Increasing L increases R because electrons have a longer path and collide with more atoms.",
    commonMistake:
      "Do not say resistance increases because the wire is heavier. The key reason is longer conducting path, not weight.",
    practiceQuestion: {
      question:
        "If a wire's length is doubled while material and thickness stay the same, what happens to its resistance?",
      hint: "Use R directly proportional to L.",
      answer: "The resistance doubles."
    },
    confidenceNote:
      "Gemini was unavailable, so this answer used DoubtDesk's built-in Class 8 science fallback."
  };
}

function mathLinearEquation(input: SolveRequest): SolveResponse | null {
  const match = input.question.match(/(-?\d*)x\s*([+-])\s*(\d+)\s*=\s*(-?\d+)/i);
  if (!match) return null;

  const coefficient = match[1] === "" || match[1] === "+" ? 1 : match[1] === "-" ? -1 : Number(match[1]);
  const sign = match[2];
  const constant = Number(match[3]) * (sign === "-" ? -1 : 1);
  const rhs = Number(match[4]);
  const value = (rhs - constant) / coefficient;

  return {
    questionTitle: "Linear equation",
    breakdown: [
      "There is one variable, x.",
      "Keep the equation balanced by doing the same operation on both sides.",
      "Move the constant first, then divide by the coefficient of x."
    ],
    briefAnswer: `The value of x is ${value}.`,
    steps: [
      `Start with ${coefficient}x ${sign} ${Math.abs(constant)} = ${rhs}.`,
      `Move ${constant} to the other side: ${coefficient}x = ${rhs - constant}.`,
      `Divide both sides by ${coefficient}.`,
      `x = ${value}.`
    ],
    finalAnswer: `x = ${value}`,
    commonMistake:
      "A common mistake is moving a number to the other side without changing its sign.",
    practiceQuestion: {
      question: "Solve 3x + 6 = 18.",
      hint: "Subtract 6 from both sides first.",
      answer: "x = 4"
    },
    confidenceNote:
      "Gemini was unavailable, so this answer used DoubtDesk's built-in equation fallback."
  };
}

export function buildFallbackSolution(input: SolveRequest): SolveResponse {
  const normalized = input.question.toLowerCase();

  if (
    input.subject === "Science" &&
    normalized.includes("resistance") &&
    normalized.includes("length")
  ) {
    return scienceResistance(input);
  }

  if (input.subject === "Math") {
    const equation = mathLinearEquation(input);
    if (equation) return equation;
  }

  return {
    questionTitle: makeTitle(input.question),
    breakdown: [
      "Identify the exact concept being asked.",
      "Separate facts given in the question from the thing you need to answer.",
      "Use the class-level rule or definition before writing the final line."
    ],
    briefAnswer:
      "This doubt can be solved by restating the question, choosing the right concept, and applying it step by step.",
    steps: genericSteps(input),
    finalAnswer:
      "Write the answer after matching the question to the relevant rule, formula, definition, or example from the chapter.",
    commonMistake:
      "Do not jump straight to the final answer before checking what the question is actually asking.",
    practiceQuestion: {
      question: `Create one similar ${input.subject} question from the same concept and solve it in two steps.`,
      hint: "Keep the numbers or example simpler than the original doubt.",
      answer: "Your answer should show the concept first, then the final result."
    },
    confidenceNote:
      "Gemini was unavailable, so this is a general study fallback. Try again later for a more specific AI answer."
  };
}
