import { useState } from "react";

// Base64 helpers for Judge0 (handles unicode safely)
function b64enc(s: string) {
  return btoa(unescape(encodeURIComponent(s)));
}
function b64dec(s: string) {
  return decodeURIComponent(escape(atob(s)));
}

const LANGUAGE_IDS = {
  typescript: 74, // TypeScript (Judge0)
  python: 71,     // Python 3
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

const HostedJudge0Runner: React.FC = () => {
  const [language, setLanguage] = useState<Lang>("typescript");
  const [source, setSource] = useState<string>(DEFAULT_SNIPPET["typescript"]);
  const [status, setStatus] = useState<string>("");
  const [stdout, setStdout] = useState<string>("");
  const [stderr, setStderr] = useState<string>("");
  const [compileOutput, setCompileOutput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function run() {
    setErrorMsg("");
    setStatus("");
    setStdout("");
    setStderr("");
    setCompileOutput("");

    try {
      const fullSource = `${source}\n\n${buildHarness(language)}`;

      const res = await fetch(
        "https://ce.judge0.com/submissions?base64_encoded=true&wait=true",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language_id: LANGUAGE_IDS[language],
            source_code: b64enc(fullSource),
          }),
        }
      );

      const data = await res.json();
      const decode = (v?: string | null) => (v ? b64dec(v) : "");

      setStatus(data?.status?.description || "Unknown");
      setStdout(decode(data?.stdout));
      setStderr(decode(data?.stderr));
      setCompileOutput(decode(data?.compile_output));

      if (!res.ok) {
        setErrorMsg(data?.error || "Run failed");
      }
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
  }

  return (
    <div>
      <h3>Hosted Judge0 Runner with Tests</h3>

      <label htmlFor="lang">Language</label>
      <select
        id="lang"
        value={language}
        onChange={(e) => onLangChange(e.target.value as Lang)}
      >
        <option value="typescript">TypeScript</option>
        <option value="python">Python 3</option>
      </select>

      <br />

      <label htmlFor="code">Source code</label>
      <br />
      <textarea
        id="code"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        style={{ width: "600px", height: "400px" }}
      />

      <br />
      <button onClick={run}>Run with Tests</button>

      {errorMsg && (
        <>
          <h4>Error</h4>
          <pre>{errorMsg}</pre>
        </>
      )}

      {status && (
        <>
          <h4>Status</h4>
          <pre>{status}</pre>
        </>
      )}

      {stdout && (
        <>
          <h4>stdout</h4>
          <pre>{stdout}</pre>
        </>
      )}

      {stderr && (
        <>
          <h4>stderr</h4>
          <pre>{stderr}</pre>
        </>
      )}

      {compileOutput && (
        <>
          <h4>compile_output</h4>
          <pre>{compileOutput}</pre>
        </>
      )}
    </div>
  );
};

export default HostedJudge0Runner;
