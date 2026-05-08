import {
  BookOpen,
  Brain,
  CheckCircle2,
  Clipboard,
  Languages,
  Loader2,
  MessageSquareText,
  RefreshCcw,
  Send,
  Sparkles,
  Target,
  TriangleAlert
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Subject =
  | "Math"
  | "Science"
  | "English"
  | "Social Science"
  | "Computer Science"
  | "Other";

type Mode = "step-by-step" | "quick" | "exam-style";

interface PracticeQuestion {
  question: string;
  hint: string;
  answer: string;
}

interface SolveResponse {
  questionTitle: string;
  breakdown: string[];
  briefAnswer: string;
  steps: string[];
  finalAnswer: string;
  commonMistake: string;
  practiceQuestion: PracticeQuestion;
  confidenceNote: string;
}

interface RecentDoubt {
  question: string;
  subject: Subject;
  grade: string;
}

const subjects: Subject[] = [
  "Math",
  "Science",
  "English",
  "Social Science",
  "Computer Science",
  "Other"
];

const modes: { value: Mode; label: string }[] = [
  { value: "step-by-step", label: "Steps" },
  { value: "quick", label: "Quick" },
  { value: "exam-style", label: "Exam" }
];

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);

const storageKey = "doubtdesk-recent";

function App() {
  const [grade, setGrade] = useState("8");
  const [subject, setSubject] = useState<Subject>("Math");
  const [mode, setMode] = useState<Mode>("step-by-step");
  const [language, setLanguage] = useState("English");
  const [question, setQuestion] = useState("");
  const [solution, setSolution] = useState<SolveResponse | null>(null);
  const [recent, setRecent] = useState<RecentDoubt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      setRecent(JSON.parse(saved));
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  const canSubmit = question.trim().length >= 8 && !isLoading;

  const answerText = useMemo(() => {
    if (!solution) return "";

    return [
      solution.questionTitle,
      "",
      solution.briefAnswer,
      "",
      "Steps:",
      ...solution.steps.map((step, index) => `${index + 1}. ${step}`),
      "",
      `Final answer: ${solution.finalAnswer}`,
      `Common mistake: ${solution.commonMistake}`,
      `Practice: ${solution.practiceQuestion.question}`,
      `Hint: ${solution.practiceQuestion.hint}`,
      `Answer: ${solution.practiceQuestion.answer}`
    ].join("\n");
  }, [solution]);

  async function submitDoubt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError("");
    setCopied(false);

    try {
      const response = await fetch(`${apiBaseUrl}/api/solve-doubt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ grade, subject, mode, language, question: question.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not solve this doubt right now.");
      }

      setSolution(data);
      rememberDoubt({ question: question.trim(), subject, grade });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not solve this doubt right now.");
      setSolution(null);
    } finally {
      setIsLoading(false);
    }
  }

  function rememberDoubt(item: RecentDoubt) {
    const next = [
      item,
      ...recent.filter((entry) => entry.question.toLowerCase() !== item.question.toLowerCase())
    ].slice(0, 4);
    setRecent(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function applyRecent(item: RecentDoubt) {
    setQuestion(item.question);
    setSubject(item.subject);
    setGrade(item.grade);
    setError("");
  }

  async function copyAnswer() {
    if (!answerText) return;
    await navigator.clipboard.writeText(answerText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function resetForm() {
    setQuestion("");
    setSolution(null);
    setError("");
    setCopied(false);
  }

  return (
    <main className="app-shell">
      <section className="workspace" aria-labelledby="app-title">
        <header className="topbar">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              <Brain size={24} />
            </span>
            <div>
              <h1 id="app-title">DoubtDesk</h1>
              <p>Class 6-12 doubt solver</p>
            </div>
          </div>
          <div className="status-pill">
            <Sparkles size={16} />
            Gemini tutor
          </div>
        </header>

        <div className="tool-grid">
          <form className="solver-panel" onSubmit={submitDoubt}>
            <div className="control-row">
              <label>
                Class
                <select value={grade} onChange={(event) => setGrade(event.target.value)}>
                  {["6", "7", "8", "9", "10", "11", "12"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Subject
                <select
                  value={subject}
                  onChange={(event) => setSubject(event.target.value as Subject)}
                >
                  {subjects.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mode-group" role="group" aria-label="Answer mode">
              {modes.map((item) => (
                <button
                  key={item.value}
                  className={mode === item.value ? "active" : ""}
                  type="button"
                  onClick={() => setMode(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <label className="language-field">
              <Languages size={16} />
              Language
              <input
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                placeholder="English, Hindi, Hinglish..."
              />
            </label>

            <label className="question-field">
              <span>
                <MessageSquareText size={18} />
                Paste your doubt
              </span>
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Example: Why does resistance increase when wire length increases?"
                rows={9}
              />
            </label>

            {error ? (
              <div className="error-banner" role="alert">
                <TriangleAlert size={18} />
                {error}
              </div>
            ) : null}

            <div className="action-row">
              <button className="primary-button" type="submit" disabled={!canSubmit}>
                {isLoading ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
                Solve doubt
              </button>
              <button className="icon-button" type="button" onClick={resetForm} aria-label="Reset">
                <RefreshCcw size={18} />
              </button>
            </div>

            {recent.length ? (
              <div className="recent-strip" aria-label="Recent doubts">
                {recent.map((item) => (
                  <button key={`${item.grade}-${item.subject}-${item.question}`} type="button" onClick={() => applyRecent(item)}>
                    <BookOpen size={14} />
                    <span>{item.question}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </form>

          <section className="answer-panel" aria-live="polite">
            {solution ? (
              <SolvedView solution={solution} copied={copied} onCopy={copyAnswer} />
            ) : (
              <EmptyState isLoading={isLoading} />
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function EmptyState({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="empty-state">
      <div className="empty-symbol">
        {isLoading ? <Loader2 className="spin" size={34} /> : <Target size={34} />}
      </div>
      <h2>{isLoading ? "Solving your doubt..." : "Your answer will appear here"}</h2>
      <div className="subject-tags">
        {subjects.slice(0, 5).map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function SolvedView({
  solution,
  copied,
  onCopy
}: {
  solution: SolveResponse;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <article className="solution-stack">
      <div className="solution-header">
        <div>
          <span className="eyebrow">Solved</span>
          <h2>{solution.questionTitle}</h2>
        </div>
        <button className="copy-button" type="button" onClick={onCopy}>
          {copied ? <CheckCircle2 size={17} /> : <Clipboard size={17} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <section className="answer-block accent-a">
        <h3>Quick answer</h3>
        <p>{solution.briefAnswer}</p>
      </section>

      <section className="answer-block">
        <h3>Break it down</h3>
        <ul className="clean-list">
          {solution.breakdown.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="answer-block">
        <h3>Steps</h3>
        <ol className="step-list">
          {solution.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="answer-block accent-b">
        <h3>Final answer</h3>
        <p>{solution.finalAnswer}</p>
      </section>

      <div className="two-column">
        <section className="answer-block warning">
          <h3>Common mistake</h3>
          <p>{solution.commonMistake}</p>
        </section>

        <section className="answer-block practice">
          <h3>Try one</h3>
          <p>{solution.practiceQuestion.question}</p>
          <p className="muted">Hint: {solution.practiceQuestion.hint}</p>
          <p className="muted">Answer: {solution.practiceQuestion.answer}</p>
        </section>
      </div>

      <p className="confidence">{solution.confidenceNote}</p>
    </article>
  );
}

export default App;
