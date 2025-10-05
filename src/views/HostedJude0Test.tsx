import { useState } from "react";
import Editor from "@monaco-editor/react";

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
        //"https://ce.judge0.com/submissions?base64_encoded=true&wait=true" <- use this if you experience rate limiting
        "http://localhost:3001/judge0/run",
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
   <div style={{
  height: "100vh",
  width: "100vw",
  display: "flex",
  flexDirection: "column",
  padding: "20px",
  gap: "20px",
  boxSizing: "border-box",
  backgroundColor: "#0e0e0e"
}}>
  {/* Header */}
  <h1 style={{color:"rgba(184, 66, 31, 1)", margin:0}}>AlgoArena Editor</h1>

  {/* Main content: editor + output */}
  <div style={{
    display: "flex",
    flex: 1,
    gap: "20px",
    minHeight: 0,
    flexWrap: "nowrap", 
  }}>
    {/* Editor Card */}
    <div style={{
      flex: 2, 
      minWidth: "400px", 
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#1b1b1b",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
      padding: "10px",
      minHeight: 0
    }}>
      <div style={{marginBottom:"10px"}}>
        <label style={{color:"#fff", marginRight:"5px"}}>Language:</label>
        <select value={language} onChange={(e)=>onLangChange(e.target.value as Lang)} style={{padding:"4px", borderRadius:"4px"}}>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
        </select>
      </div>
      <Editor
        height="100%"
        theme="vs-dark"
        language={language}
        value={source}
        onChange={(val)=>val && setSource(val)}
        options={{automaticLayout:true, fontSize:16, minimap:{enabled:false}}}
      />
    </div>

    {/* Output Card */}
    <div style={{
      flex: 1, 
      minWidth: "300px",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#1b1b1b",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
      padding: "10px",
      minHeight: 0
    }}>
      <button onClick={run} style={{
        padding:"8px",
        borderRadius:"6px",
        backgroundColor:"rgba(127, 136, 136, 1)",
        border:"none",
        color:"#000",
        fontWeight:"bold",
        marginBottom:"10px",
        cursor:"pointer"
      }}>Run Code</button>
      <div style={{
        flex: 1,
        backgroundColor:"#010101",
        padding:"10px",
        borderRadius:"6px",
        color:"rgba(54, 139, 54, 1)",
        fontFamily:"monospace",
        overflowY:"auto",
        whiteSpace:"pre-wrap",
        minHeight:0
      }}>
        {errorMsg && <><strong>Error:</strong> {errorMsg}\n</>}
        {status && <><strong>Status:</strong> {status}\n</>}
        {stdout && <><strong>stdout:</strong>\n{stdout}\n</>}
        {stderr && <><strong>stderr:</strong>\n{stderr}\n</>}
      </div>
    </div>
  </div>
</div>


  );
};
export default HostedJudge0Runner;
 