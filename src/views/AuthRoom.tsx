import { useEffect, useState } from "react";
import io from "socket.io-client";

type UserJoinedPayload = {
  username: string;
};

const socket = io("http://localhost:3001", {
  transports: ["websocket"],
});

const AuthRoom: React.FC = () => {
  const [joinedRoom, setJoinedRoom] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const [inputRoom, setInputRoom] = useState<string>("");

  const [members, setMembers] = useState<string[]>([]);

  const [allowUsername, setAllowUsername] = useState<string>("");

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const onConnectError = (err: Error) => {
      console.error("Socket connect error:", err.message);
    };

    const onUserJoined = (p: UserJoinedPayload) => {
      setMessages((prev) => [...prev, `${p.username} joined`]);

      setMembers((prev) => (prev.includes(p.username) ? prev : [...prev, p.username]));
    };

    socket.on("connect_error", onConnectError);
    socket.on("userJoined", onUserJoined);

    return () => {
      socket.off("connect_error", onConnectError);
      socket.off("userJoined", onUserJoined);
    };
  }, []);

  useEffect(() => {
    const handleTimerUpdate = (payload: { timeLeft: number }) => {
      setTimeLeft(payload.timeLeft);
    };

    const handleRoomClosed = () => {
      alert("Room has been closed due to timer expiration.");
      setJoinedRoom("");
      setMessages([]);
      setMembers([]);
      setTimeLeft(null);
    };

    socket.on("timerUpdate", handleTimerUpdate);
    socket.on("roomClosed", handleRoomClosed);

    return () => {
      socket.off("timerUpdate", handleTimerUpdate);
      socket.off("roomClosed", handleRoomClosed);
    };
  }, []);

  const createRoom = () => {
    // reset view
    setMessages([]);
    setMembers([]);
    setTimeLeft(null);

    const opts =
      allowUsername.trim().length > 0 ? { allow: { username: allowUsername.trim() } } : {};

    socket.emit("createRoom", opts, ({ roomCode }: { roomCode: string }) => {
      setJoinedRoom(roomCode);
      setMessages([`You created room: ${roomCode}`]);
    });
  };

  const joinRoom = () => {
    const code = inputRoom.trim();
    if (!code) return;

    setMessages([]);
    setMembers([]);
    setTimeLeft(null);

    socket.emit(
      "joinRoom",
      code,
      (res: { success?: boolean; roomCode?: string; error?: string; members?: string[] }) => {
        if (res?.error) {
          alert(res.error);
        } else if (res?.roomCode) {
          setJoinedRoom(res.roomCode);
          setMessages([`You joined room: ${res.roomCode}`]);

          setMembers(res.members ?? []);
        }
      }
    );
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Algo Arena Rooms</h1>

      {!joinedRoom ? (
        <>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Allowed username (optional):{" "}
              <input
                placeholder="e.g. alice"
                value={allowUsername}
                onChange={(e) => setAllowUsername(e.target.value)}
                style={{ marginLeft: "0.5rem" }}
              />
            </label>
          </div>

          <button onClick={createRoom}>Create Room</button>

          <br />
          <br />

          <input
            placeholder="Enter Room Code"
            value={inputRoom}
            onChange={(e) => setInputRoom(e.target.value)}
          />
          <button onClick={joinRoom} style={{ marginLeft: "0.5rem" }}>
            Join Room
          </button>
        </>
      ) : (
        <>
          <h2>Room: {joinedRoom}</h2>

          {timeLeft !== null && <h3>Time Left: {timeLeft} seconds</h3>}

          <h3>Members</h3>
          {members.length === 0 ? (
            <p>Fetching members…</p>
          ) : (
            <ul>
              {members.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          )}

          <h3>Activity</h3>
          <ul>
            {messages.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AuthRoom;
