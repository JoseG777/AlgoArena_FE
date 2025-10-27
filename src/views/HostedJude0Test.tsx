import { useState } from "react";
import Editor from "@monaco-editor/react";
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

const DEFAULT_SNIPPET: Record<Lang, string> = {
  typescript: `function twoSum(nums: number[], target: number): number[] {
  const lookup: Record<number, number> = {};
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (lookup[diff] !== undefined) {
      return [lookup[diff], i];
    }
    lookup[nums[i]] = i;
  }
  return [];
}
`,
  python: `def two_sum(nums, target):
    lookup = {}
    for i, n in enumerate(nums):
        if target - n in lookup:
            return [lookup[target - n], i]
        lookup[n] = i
    return []
`,
};

// Harness generators: run hidden tests on user code
function buildHarness(lang: Lang): string {
  if (lang === "python") {
    return `
def run_tests():
    test_cases = [
        (([2,7,11,15], 9), [0,1]),
        (([3,2,4], 6), [1,2]),
        (([3,3], 6), [0,1]),
        (([1,2,3], 7), []),
    ]
    for i, (args, expected) in enumerate(test_cases, 1):
        result = two_sum(*args)
        print(f"Case {i}: {'PASS' if result == expected else 'FAIL'} | Got {result}, Expected {expected}")

run_tests()
`;
  }

  // TypeScript harness
  return `
function runTests() {
  const testCases: { args: [number[], number]; expected: number[] }[] = [
    { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
    { args: [[3, 2, 4], 6], expected: [1, 2] },
    { args: [[3, 3], 6], expected: [0, 1] },
    { args: [[1, 2, 3], 7], expected: [] },
  ];

  testCases.forEach((tc, i) => {
    const result = twoSum(...tc.args);
    console.log(
      "Case " + (i + 1) + ": " +
      (JSON.stringify(result) === JSON.stringify(tc.expected) ? "PASS" : "FAIL") +
      " | Got " + JSON.stringify(result) +
      ", Expected " + JSON.stringify(tc.expected)
    );
  });
}

runTests();
`;
}

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
  const [language, setLanguage] = useState<Lang>("typescript");
  const [source, setSource] = useState<string>(DEFAULT_SNIPPET["typescript"]);

  const [status, setStatus] = useState<string>("");
  const [stdout, setStdout] = useState<string>("");
  const [stderr, setStderr] = useState<string>("");
  const [compileOutput, setCompileOutput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [score, setScore] = useState<number | null>(null);
  const [passes, setPasses] = useState<number | null>(null);
  const [fails, setFails] = useState<number | null>(null);

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

      const res = await fetch(
        //"https://ce.judge0.com/submissions?base64_encoded=true&wait=true" <- use this if you experience rate limiting
        "http://localhost:3001/judge0/run",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            language_id: LANGUAGE_IDS[language],
            source_code: b64enc(fullSource),
          }),
        }
      );

      const data: BackendGraded | { error: string } = await res.json();

      if (!res.ok) {
        setErrorMsg((data as any)?.error || "Run failed");
        return;
      }

      const d = data as BackendGraded;
      console.log(d);

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
    setSource(DEFAULT_SNIPPET[next]);
    setStatus("");
    setStdout("");
    setStderr("");
    setCompileOutput("");
    setErrorMsg("");
    setScore(null);
    setPasses(null);
    setFails(null);
  }

  const isCompileError = /Compilation Error/i.test(status);

  return (
    <div className="aa-root">
      <h1 className="aa-title">AlgoArena Editor</h1>

      <div className="aa-row">
        {/* Editor Card */}
        <div className="aa-card">
          <div className="aa-control-row">
            <label className="aa-label">Language:</label>
            <select
              value={language}
              onChange={(e) => onLangChange(e.target.value as Lang)}
              className="aa-select"
            >
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
            </select>
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

        {/* Right Panel */}
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
