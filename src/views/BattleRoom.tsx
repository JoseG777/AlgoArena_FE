import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { socket } from "../lib/socket";
import "./Arena/Arena.css";

type Lang = "typescript" | "python";
const LANGUAGE_IDS: Record<Lang, number> = { typescript: 74, python: 71 };

type ProblemDTO = {
  problemId: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  startingCode: Record<Lang, string>;
};

type RoomDTO = {
  code: string;
  problem: ProblemDTO;
  timeLeft: number;
  expiresAt: string;
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

function b64enc(s: string) {
  return btoa(unescape(encodeURIComponent(s)));
}

const BattleRoom: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const initialLangParam = (params.get("lang") || "typescript").toLowerCase();
  const initialLang: Lang = initialLangParam === "python" ? "python" : "typescript";

  const [room, setRoom] = useState<RoomDTO | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [members, setMembers] = useState<string[]>([]);

  const [language, setLanguage] = useState<Lang>(initialLang);
  const [source, setSource] = useState<string>("");

  const [status, setStatus] = useState<string>("");
  const [stdout, setStdout] = useState<string>("");
  const [stderr, setStderr] = useState<string>("");
  const [compileOutput, setCompileOutput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [score, setScore] = useState<number | null>(null);

  const joinedRef = useRef<string>("");

  useEffect(() => {
    let aborted = false;
    (async () => {
      if (!code) return;
      try {
        const res = await fetch(`http://localhost:3001/rooms/${encodeURIComponent(code)}`, {
          credentials: "include",
        });
        if (!res.ok) {
          navigate("/dash-board", { replace: true });
          return;
        }
        const data: RoomDTO = await res.json();
        if (aborted) return;

        setRoom(data);
        setTimeLeft(typeof data.timeLeft === "number" ? data.timeLeft : null);

        const langSafe: Lang = initialLang;
        setLanguage(langSafe);
        setSource(data.problem.startingCode[langSafe] || "");
      } catch {
        navigate("/dash-board", { replace: true });
      }
    })();
    return () => {
      aborted = true;
    };
  }, [code, initialLang, navigate]);

  useEffect(() => {
    if (!code) return;

    const onTimerUpdate = (p: { timeLeft: number }) => setTimeLeft(p.timeLeft);
    const onRoomClosed = () => {
      alert("Room has been closed.");
      joinedRef.current = "";
      navigate("/dash-board", { replace: true });
    };
    const onUserJoined = (p: { username: string }) => {
      setMembers((prev) => (prev.includes(p.username) ? prev : [...prev, p.username]));
    };

    socket.emit(
      "joinRoom",
      code,
      (res: {
        success?: boolean;
        roomCode?: string;
        error?: string;
        members?: string[];
        timeLeft?: number;
      }) => {
        if (res?.error || !res?.success) {
          navigate("/dash-board", { replace: true });
          return;
        }
        joinedRef.current = res.roomCode!;
        setMembers(res.members ?? []);
        if (typeof res.timeLeft === "number") setTimeLeft(res.timeLeft);
      }
    );

    socket.on("timerUpdate", onTimerUpdate);
    socket.on("roomClosed", onRoomClosed);
    socket.on("userJoined", onUserJoined);

    return () => {
      socket.off("timerUpdate", onTimerUpdate);
      socket.off("roomClosed", onRoomClosed);
      socket.off("userJoined", onUserJoined);
      if (joinedRef.current) {
        socket.emit("leaveRoom", joinedRef.current);
        joinedRef.current = "";
      }
    };
  }, [code, navigate]);

  useEffect(() => {
    if (!room) return;
    setSource(room.problem.startingCode[language] || "");
  }, [language, room]);

  const canRun = timeLeft !== null && timeLeft > 0;

  async function run() {
    if (!room) return;
    setErrorMsg("");
    setStatus("");
    setStdout("");
    setStderr("");
    setCompileOutput("");
    setScore(null);

    try {
      const res = await fetch("http://localhost:3001/judge0/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          language_id: LANGUAGE_IDS[language],
          source_code: b64enc(source),
          problemId: room.problem.problemId,
          lang: language,
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
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
    }
  }

  if (!room) {
    return (
      <div className="aa-root">
        <h1 className="aa-title">AlgoArena Editor</h1>
        <div style={{ color: "#aaa" }}>Loading room…</div>
      </div>
    );
  }

  return (
    <div className="aa-root">
      <h1 className="aa-title">AlgoArena Editor</h1>

      <div style={{ color: "#aaa", marginBottom: 8 }}>
        Room: <strong>{room.code}</strong> · Problem: <strong>{room.problem.title}</strong> (
        {room.problem.problemId}) · Difficulty: <strong>{room.problem.difficulty}</strong> · Time
        left: <strong>{timeLeft ?? "—"}</strong>s
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
                onChange={(e) => setLanguage(e.target.value as Lang)}
                className="aa-select"
              >
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
              </select>
            </div>
          </div>

          <Editor
            className="aa-editor"
            height="100%"
            theme="vs-dark"
            language={language}
            value={source}
            onChange={(val) => val !== undefined && setSource(val)}
            options={{ automaticLayout: true, fontSize: 16, minimap: { enabled: false } }}
          />
        </div>

        <div className="aa-side">
          <button onClick={run} className="aa-run-btn" disabled={!canRun}>
            {canRun ? "Run Code" : "Time is up"}
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

            <div className="aa-status-line">{status && <span>{status}</span>}</div>
          </div>

          <div className="aa-log">
            {errorMsg && (
              <>
                <strong>Error:</strong> {errorMsg}
                <br />
              </>
            )}
            {stdout && (
              <>
                <strong>stdout:</strong>
                <br />
                {stdout}
                <br />
              </>
            )}
            {stderr && (
              <>
                <strong>stderr:</strong>
                <br />
                {stderr}
                <br />
              </>
            )}
            {compileOutput && (
              <>
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

export default BattleRoom;
