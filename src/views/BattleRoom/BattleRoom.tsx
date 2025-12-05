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

type MemberDTO = { username: string; score: number; finished?: boolean };

type RoomDTO = {
  code: string;
  problem: ProblemDTO;
  timeLeft: number | null;
  expiresAt: string;
  started: boolean;
  members?: MemberDTO[];
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
  hasHiddenCase?: boolean;
  hiddenCasePassed?: boolean;
};

type ApiError = { error?: string };

type CodingResultsPayload = {
  roomCode: string;
  yourScore: number;
  leaderboard: { username: string; score: number }[];
  isTie: boolean;
  youWon: boolean;
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
  const [started, setStarted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [members, setMembers] = useState<MemberDTO[]>([]);

  const [language, setLanguage] = useState<Lang>(initialLang);
  const [source, setSource] = useState<string>("");
  const [showDesc, setShowDesc] = useState<boolean>(false);

  const [status, setStatus] = useState<string>("");
  const [stdout, setStdout] = useState<string>("");
  const [stderr, setStderr] = useState<string>("");
  const [compileOutput, setCompileOutput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [score, setScore] = useState<number | null>(null);

  const [finished, setFinished] = useState(false);

  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [didWin, setDidWin] = useState<boolean | null>(null);
  const [isTie, setIsTie] = useState<boolean>(false);
  const [finalLeaderboard, setFinalLeaderboard] = useState<
    { username: string; score: number }[]
  >([]);

  const [hasHiddenCase, setHasHiddenCase] = useState<boolean | null>(null);
  const [hiddenCasePassed, setHiddenCasePassed] = useState<boolean | null>(null);

  const joinedRef = useRef<string>("");

  useEffect(() => {
    let aborted = false;
    (async () => {
      if (!code) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${encodeURIComponent(code)}`, {
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

        setMembers(Array.isArray(data.members) ? data.members : []);

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
      joinedRef.current = "";
      if (!showResults) {
        alert("Room has been closed.");
        navigate("/dash-board", { replace: true });
      }
    };
    const onUserJoined = (p: { username: string }) => {
      setMembers((prev) => {
        if (prev.some((m) => m.username === p.username)) return prev;
        return [...prev, { username: p.username, score: 0, finished: false }];
      });
    };
    const onMembersUpdated = (updated: MemberDTO[]) => setMembers(updated);
    const onBattleStarted = (p: { timeLeft: number; expiresAt: string }) => {
      setStarted(true);
      setTimeLeft(p.timeLeft);
    };

    const onCodingResults = (payload: CodingResultsPayload) => {
      if (!code || payload.roomCode !== code) return;
      setFinalScore(payload.yourScore);
      setScore(payload.yourScore);
      setFinalLeaderboard(payload.leaderboard);
      setDidWin(payload.youWon);
      setIsTie(payload.isTie);
      setShowResults(true);
    };

    const joinCurrentRoom = () => {
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
            console.error("joinRoom failed:", res?.error);
            navigate("/dash-board", { replace: true });
            return;
          }
          joinedRef.current = res.roomCode!;
          setMembers((prev) =>
            (res.members ?? []).map((u) => ({
              username: u,
              score: prev.find((m) => m.username === u)?.score ?? 0,
              finished: prev.find((m) => m.username === u)?.finished ?? false,
            }))
          );
          setStarted(Boolean(res.started));
          setTimeLeft(typeof res.timeLeft === "number" ? res.timeLeft : null);
        }
      );
    };

    const onConnect = () => {
      joinCurrentRoom();
    };

    socket.on("connect", onConnect);
    socket.on("timerUpdate", onTimerUpdate);
    socket.on("roomClosed", onRoomClosed);
    socket.on("userJoined", onUserJoined);
    socket.on("membersUpdated", onMembersUpdated);
    socket.on("battleStarted", onBattleStarted);
    socket.on("codingResults", onCodingResults);

    if (socket.connected) joinCurrentRoom();

    return () => {
      socket.off("connect", onConnect);
      socket.off("timerUpdate", onTimerUpdate);
      socket.off("roomClosed", onRoomClosed);
      socket.off("userJoined", onUserJoined);
      socket.off("membersUpdated", onMembersUpdated);
      socket.off("battleStarted", onBattleStarted);
      socket.off("codingResults", onCodingResults);
      joinedRef.current = "";
    };
  }, [code, navigate, showResults]);

  useEffect(() => {
    if (!room) return;
    setSource(room.problem.startingCode[language] || "");
  }, [language, room]);

  const canRun = started && timeLeft !== null && timeLeft > 0 && !finished;

  async function run() {
    if (!room || !started || finished) return;
    setErrorMsg("");
    setStatus("");
    setStdout("");
    setStderr("");
    setCompileOutput("");
    setScore(null);
    setHasHiddenCase(null);
    setHiddenCasePassed(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/judge0/run`, {
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

      if (typeof d.hasHiddenCase === "boolean") {
        setHasHiddenCase(d.hasHiddenCase);
      } else {
        setHasHiddenCase(null);
      }

      if (typeof d.hiddenCasePassed === "boolean") {
        setHiddenCasePassed(d.hiddenCasePassed);
      } else {
        setHiddenCasePassed(null);
      }

      if (typeof d.score === "number") {
        socket.emit("updateScore", room.code, d.score);
      }
    } catch (e: unknown) {
      if (e instanceof Error) setErrorMsg(e.message);
      else setErrorMsg("Network error");
    }
  }

  function finishNow() {
    if (!room || finished) return;
    setFinished(true);
    socket.emit("finish", room.code);
  }

  if (!room || !started) {
    return (
      <div className="aa-root">
        <h1 className="aa-title">Battle Room</h1>
        <div style={{ color: "#aaa" }}>Loading… (waiting for opponent)</div>
      </div>
    );
  }

  const effectiveFinalScore = finalScore ?? score ?? 0;

  return (
    <div className="aa-root">
      <h1 className="aa-title">Battle Room</h1>

      <div style={{ color: "#aaa", marginBottom: 8 }}>
        Room: <strong>{room.code}</strong> · Problem: <strong>{room.problem.title}</strong> (
        {room.problem.problemId}) · Difficulty: <strong>{room.problem.difficulty}</strong> · Time
        left: <strong>{timeLeft ?? "—"}</strong>s · Members:{" "}
        {members.length > 0 ? (
          members.map((member, i) => (
            <span key={member.username} title={member.finished ? "Finished" : "Active"}>
              {member.username} (Score: {member.score}
              {member.finished ? " ✓" : ""}){i < members.length - 1 && " · "}
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
            <div id="aa-problem-desc" className="aa-problem-desc">
              <h2>{room.problem.title}</h2>
              <div>{room.problem.problemDescription}</div>
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
            {canRun ? "Run Code" : finished ? "Finished" : "Time is up"}
          </button>

          <button
            onClick={finishNow}
            className="aa-run-btn"
            disabled={finished || !started}
            style={{ marginTop: 8 }}
          >
            {finished ? "Finished" : "Finish"}
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

            {hasHiddenCase && (
              <>
                <strong>Hidden test case:</strong>{" "}
                {hiddenCasePassed === null
                  ? "Unknown"
                  : hiddenCasePassed
                  ? "PASS"
                  : "FAIL"}
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

      {showResults && (
        <div className="aa-results-overlay">
          <div className="aa-results-card">
            <h2 className="aa-results-title">Match Results</h2>

            {didWin !== null && (
              <div
                className="aa-results-status"
                style={{
                  color: isTie ? "#fbbf24" : didWin ? "#4ade80" : "#f87171",
                }}
              >
                {isTie
                  ? "It's a tie!"
                  : didWin
                  ? "You won this match!"
                  : "You lost this one — good try!"}
              </div>
            )}

            <div style={{ marginBottom: 8 }}>
              <strong>Your Points:</strong> {effectiveFinalScore}
            </div>

            {finalLeaderboard.length > 0 && (
              <div className="aa-results-leaderboard">
                <div className="aa-results-leaderboard-title">Results</div>
                {finalLeaderboard.map((m, idx) => (
                  <div key={m.username + idx} className="aa-results-leader-row">
                    <span>
                      {idx + 1}. {m.username}
                    </span>
                    <span>{m.score}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              className="aa-run-btn aa-results-done"
              onClick={() => {
                if (room) {
                  socket.emit("leaveRoom", room.code);
                }
                setShowResults(false);
                navigate("/dash-board", { replace: true });
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleRoom;
