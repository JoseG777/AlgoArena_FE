import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { socket } from "../../lib/socket";
import "./BattleRoom.css";

type Lang = "typescript" | "python";
const LANGUAGE_IDS: Record<Lang, number> = { typescript: 74, python: 71 };

type ProblemDTO = {
  problemId: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  startingCode: Record<Lang, string>;
  problemDescription: string;
};

type RoomDTO = {
  code: string;
  problem: ProblemDTO;
  timeLeft: number | null;
  expiresAt: string;
  started: boolean;
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

type ApiError = { error?: string };

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
  const [started, setStarted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [members, setMembers] = useState<{ username: string; score: number }[]>([]);

  const [language, setLanguage] = useState<Lang>(initialLang);
  const [source, setSource] = useState<string>("");
  const [showDesc, setShowDesc] = useState<boolean>(false);

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
        setStarted(Boolean(data.started));
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
      setMembers((prev) => {
        if (prev.some((m) => m.username === p.username)) return prev;
        return [...prev, { username: p.username, score: 0 }];
      });
    };
    const onMembersUpdated = (updatedMembers: { username: string; score: number }[]) => {
      setMembers((prev) => {
        const map = new Map<string, { username: string; score: number }>();
        for (const m of prev) map.set(m.username, m);
        for (const m of updatedMembers) map.set(m.username, m);
        return Array.from(map.values());
      });
    };
    const onBattleStarted = (p: { timeLeft: number; expiresAt: string }) => {
      setStarted(true);
      setTimeLeft(p.timeLeft);
    };

    socket.on("timerUpdate", onTimerUpdate);
    socket.on("roomClosed", onRoomClosed);
    socket.on("userJoined", onUserJoined);
    socket.on("membersUpdated", onMembersUpdated);
    socket.on("battleStarted", onBattleStarted);

    socket.emit(
      "joinRoom",
      code,
      (res: {
        success?: boolean;
        roomCode?: string;
        error?: string;
        members?: string[];
        timeLeft?: number | null;
        started?: boolean;
      }) => {
        if (res?.error || !res?.success) {
          navigate("/dash-board", { replace: true });
          return;
        }
        joinedRef.current = res.roomCode!;

        setMembers((prev) => {
          const initialMembers =
            res.members?.map((username) => ({
              username,
              score: prev.find((m) => m.username === username)?.score ?? 0,
            })) ?? [];
          return initialMembers;
        });

        setStarted(Boolean(res.started));
        if (typeof res.timeLeft === "number") setTimeLeft(res.timeLeft);
        else setTimeLeft(null);
      }
    );

    return () => {
      socket.off("timerUpdate", onTimerUpdate);
      socket.off("roomClosed", onRoomClosed);
      socket.off("userJoined", onUserJoined);
      socket.off("membersUpdated", onMembersUpdated);
      socket.off("battleStarted", onBattleStarted);
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

  const canRun = started && timeLeft !== null && timeLeft > 0;

  async function run() {
    if (!room || !started) return;
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

      const data: unknown = await res.json();

      if (!res.ok) {
        const err = data as ApiError;
        setErrorMsg(err.error ?? "Run failed");
        return;
      }

      const d = data as BackendGraded;

      setStatus(d.status || "Unknown");
      setStdout(d.stdout || "");
      setStderr(d.stderr || "");
      setCompileOutput(d.compile_output || "");
      setScore(typeof d.score === "number" ? d.score : null);
      if (typeof d.score === "number") {
        socket.emit("updateScore", room.code, d.score);
      }
    } catch (e: unknown) {
      if (e instanceof Error) setErrorMsg(e.message);
      else setErrorMsg("Network error");
    }
  }

  if (!room || !started) {
    return (
      <div className="aa-root">
        <h1 className="aa-title">Battle Room</h1>
        <div style={{ color: "#aaa" }}>Loading… (waiting for opponent)</div>
      </div>
    );
  }

  return (
    <div className="aa-root">
      <h1 className="aa-title">Battle Room</h1>

      <div style={{ color: "#aaa", marginBottom: 8 }}>
        Room: <strong>{room.code}</strong> · Problem: <strong>{room.problem.title}</strong> (
        {room.problem.problemId}) · Difficulty: <strong>{room.problem.difficulty}</strong> · Time
        left: <strong>{timeLeft ?? "—"}</strong>s · Members:{" "}
        {members.length > 0 ? (
          members.map((member, i) => (
            <span key={member.username}>
              {member.username} (Score: {member.score}){i < members.length - 1 && " · "}
            </span>
          ))
        ) : (
          <span>No members yet</span>
        )}
      </div>

      <div className="aa-row">
        <div className="aa-card">
          <div
            className="aa-control-row"
            style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}
          >
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

            <div>
              <button
                onClick={() => setShowDesc((s) => !s)}
                aria-expanded={showDesc}
                aria-controls="aa-problem-desc"
                style={{
                  marginLeft: 8,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                  color: "#e6f6ff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {showDesc ? "Hide Problem" : "Show Problem"}
              </button>
            </div>
          </div>

          {showDesc && (
            <div
              id="aa-problem-desc"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(76, 201, 240, 0.04)",
                padding: 12,
                borderRadius: 8,
                marginBottom: 10,
                maxHeight: 280,
                overflow: "auto",
                color: "#e6f6ff",
                whiteSpace: "pre-wrap",
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{room.problem.title}</div>
              <div style={{ color: "#d6f6ff" }}>{room.problem.problemDescription}</div>
            </div>
          )}

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
