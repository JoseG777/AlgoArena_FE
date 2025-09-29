import { useState } from "react";

// Base64 helpers for Judge0 (handles unicode safely)
function b64enc(s: string) {
  return btoa(unescape(encodeURIComponent(s)));
}
function b64dec(s: string) {
  return decodeURIComponent(escape(atob(s)));
}

// Judge0 language IDs we’ll support
const LANGUAGE_IDS = {
  typescript: 74, // TypeScript (Judge0)
  python: 71,     // Python 3
} as const;

type Lang = keyof typeof LANGUAGE_IDS;

const DEFAULT_SNIPPET: Record<Lang, string> = {
  typescript: `// TypeScript example
// Note: TypeScript runs under Node in Judge0
// Just write TS; no imports needed.
let greeting : string;
greeting = "Hello, Judge0!";
console.log(greeting);
`,
  python: `# Python example
print("Hello, Judeg0!")
`,
};

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
      const res = await fetch(
        "https://ce.judge0.com/submissions?base64_encoded=true&wait=true",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language_id: LANGUAGE_IDS[language],
            source_code: b64enc(source),
            // stdin / expected_output omitted for simplicity
          }),
        }
      );

      const data = await res.json();

      // Judge0 returns base64 when base64_encoded=true
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
      <h3>Hosted Judge0 Runner</h3>

      <label htmlFor="lang">Language</label>
      <select
        id="lang"
        value={language}
        onChange={(e) => onLangChange(e.target.value as Lang)}
      >
        <option value="typescript">TypeScript</option>
        <option value="python">Python 3</option>
      </select>

      <br/>

      <label htmlFor="code">Source code</label>
      <br/>
      <textarea
        id="code"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        style={{ width: "600px", height: "400px" }}
      />

      <br/>
      <button onClick={run}>Run</button>

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
