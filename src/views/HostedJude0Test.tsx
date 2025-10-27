import { useState, useEffect, useMemo } from "react";
import Editor from "@monaco-editor/react";
import problems from "../data/problems.json";
import "./Arena/Arena.css";

// Base64 helpers for Judge0 (handles unicode safely)
function b64enc(s: string) {
  return btoa(unescape(encodeURIComponent(s)));
}

const LANGUAGE_IDS = {
  typescript: 74,
  python: 71,
} as const;

type Lang = keyof typeof LANGUAGE_IDS;

const gameKey = (problemId: string) => `aa:gameStartTs:${problemId}`;

function getOrInitGameStartTs(problemId: string) {
  const k = gameKey(problemId);
  const existing = localStorage.getItem(k);
  if (existing) return Number(existing);
  const ts = Date.now();
  localStorage.setItem(k, String(ts));
  return ts;
}

function resetGameStartTs(problemId: string) {
  const ts = Date.now();
  localStorage.setItem(gameKey(problemId), String(ts));
  return ts;
}

type Problem = {
  problemId: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  startingCode: Record<Lang, string>;
  testHarness: Record<Lang, string>;
};

type BackendGraded = {
  status: string;
  time: string | null;
  memory: number | null;
  stdout: string;
  stderr: string;
  compile_output: string;
  score: number;
  breakdown: Record<string, number | string>;
};

const HostedJudge0Runner: React.FC = () => {
  const defaultProblemId =
    (Array.isArray(problems) && (problems as Problem[])[0]?.problemId) || "two-sum";
  const [selectedProblemId, setSelectedProblemId] = useState<string>(defaultProblemId);

  const problem: Problem | undefined = useMemo(
    () => (problems as Problem[]).find((p) => p.problemId === selectedProblemId),
    [selectedProblemId]
  );

  const [language, setLanguage] = useState<Lang>("typescript");
  const [source, setSource] = useState<string>("");

  const [status, setStatus] = useState<string>("");
  const [stdout, setStdout] = useState<string>("");
  const [stderr, setStderr] = useState<string>("");
  const [compileOutput, setCompileOutput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [score, setScore] = useState<number | null>(null);
  const [passes, setPasses] = useState<number | null>(null);
  const [fails, setFails] = useState<number | null>(null);

  const [gameStartTs, setGameStartTs] = useState<number>(() =>
    getOrInitGameStartTs(selectedProblemId)
  );

  useEffect(() => {
    if (!problem) return;
    setSource(problem.startingCode[language] ?? "");
  }, [problem, language, selectedProblemId]);

  if (!problem) {
    return (
      <div className="aa-root">
        <h1 className="aa-title">AlgoArena Editor</h1>
        <div style={{ color: "#f88", padding: 16 }}>Problem "{selectedProblemId}" not found.</div>
      </div>
    );
  }

  const prob: Problem = problem;

  function buildHarness(lang: Lang): string {
    return prob.testHarness[lang] ?? "";
  }

  async function run() {
    setErrorMsg("");
    setStatus("");
    setStdout("");
    setStderr("");
    setCompileOutput("");
    setScore(null);
    setPasses(null);
    setFails(null);

    try {
      const fullSource = `${source}\n\n${buildHarness(language)}`;

      const res = await fetch("http://localhost:3001/judge0/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          language_id: LANGUAGE_IDS[language],
          source_code: b64enc(fullSource),
          problemId: selectedProblemId,
          gameStartTs,
        }),
      });

      const data: BackendGraded | { error: string } = await res.json();

      if (!res.ok) {
        setErrorMsg((data as any)?.error || "Run failed");
        return;
      }

      const d = data as BackendGraded;

      setStatus(d.status || "Unknown");
      setStdout(d.stdout || "");
      setStderr(d.stderr || "");
      setCompileOutput(d.compile_output || "");
      setScore(typeof d.score === "number" ? d.score : null);

      const b = d.breakdown || {};
      const ps = typeof b["passes"] === "number" ? (b["passes"] as number) : null;
      const fs = typeof b["fails"] === "number" ? (b["fails"] as number) : null;
      setPasses(ps);
      setFails(fs);
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
    }
  }

  function onLangChange(next: Lang) {
    setLanguage(next);
  }

  function onProblemChange(nextId: string) {
    setSelectedProblemId(nextId);
    const ts = getOrInitGameStartTs(nextId);
    setGameStartTs(ts);
    setStatus("");
    setStdout("");
    setStderr("");
    setCompileOutput("");
    setScore(null);
    setPasses(null);
    setFails(null);
  }

  function startNewGame() {
    const ts = resetGameStartTs(selectedProblemId);
    setGameStartTs(ts);
    setStatus("");
    setStdout("");
    setStderr("");
    setCompileOutput("");
    setScore(null);
    setPasses(null);
    setFails(null);
    setSource(prob.startingCode[language] ?? "");
  }

  const isCompileError = /Compilation Error/i.test(status);

  return (
    <div className="aa-root">
      <h1 className="aa-title">AlgoArena Editor</h1>

      <div style={{ color: "#aaa", marginBottom: 8 }}>
        Problem: <strong>{prob.title}</strong> ({prob.problemId}) · Difficulty:{" "}
        <strong>{prob.difficulty}</strong> {/*· Game Start:{" "}
        <strong>{new Date(gameStartTs).toLocaleTimeString()}</strong>*/}
      </div>

      <div className="aa-row">
        <div className="aa-card">
          <div className="aa-control-row" style={{ gap: 8, flexWrap: "wrap" }}>
            <div>
              <label className="aa-label" style={{ marginRight: 6 }}>
                Language:
              </label>
              <select
                value={language}
                onChange={(e) => onLangChange(e.target.value as Lang)}
                className="aa-select"
              >
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
              </select>
            </div>

            <div>
              <label className="aa-label" style={{ marginRight: 6 }}>
                Problem:
              </label>
              <select
                value={selectedProblemId}
                onChange={(e) => onProblemChange(e.target.value)}
                className="aa-select"
              >
                {(problems as Problem[]).map((p) => (
                  <option key={p.problemId} value={p.problemId}>
                    {p.title} ({p.difficulty})
                  </option>
                ))}
              </select>
            </div>

            <button className="aa-run-btn" onClick={startNewGame}>
              Start New Game
            </button>
          </div>

          <Editor
            className="aa-editor"
            height="100%"
            theme="vs-dark"
            language={language}
            value={source}
            onChange={(val) => val && setSource(val)}
            options={{ automaticLayout: true, fontSize: 16, minimap: { enabled: false } }}
          />
        </div>

        <div className="aa-side">
          <button onClick={run} className="aa-run-btn">
            Run Code
          </button>

          <div className="aa-metrics">
            <div className="aa-metrics-row">
              <strong>Score:</strong>
              <span
                className={
                  "aa-score " + ((score ?? 0) >= 70 ? "good" : (score ?? 0) >= 0 ? "warn" : "bad")
                }
              >
                {score ?? "—"}
              </span>
            </div>

            <div className="aa-status-line">
              {status && (
                <span className={isCompileError ? "aa-status-err" : "aa-status-ok"}>
                  {isCompileError ? "Compilation Error" : "No compilation error"}
                </span>
              )}

              {(passes !== null || fails !== null) && (
                <>
                  <br />
                  <span className="aa-sep"> · </span>
                  <span className="aa-cases">
                    Cases: {passes ?? 0} passed | {fails ?? 0} failed
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="aa-log">
            {errorMsg && (
              <>
                <strong>Error:</strong> {errorMsg}
                <br />
              </>
            )}
            {status && (
              <>
                <strong>Status:</strong> {status}
              </>
            )}
            {stdout && (
              <>
                <br />
                <strong>stdout:</strong>
                <br />
                {stdout}
              </>
            )}
            {stderr && (
              <>
                <br />
                <strong>stderr:</strong>
                <br />
                {stderr}
              </>
            )}
            {compileOutput && (
              <>
                <br />
                <strong>compile_output:</strong>
                <br />
                {compileOutput}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostedJudge0Runner;
