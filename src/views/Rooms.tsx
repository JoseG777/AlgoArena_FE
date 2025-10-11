import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001", {
  transports: ["websocket"]
});

const Rooms: React.FC = () => {
  const [joinedRoom, setJoinedRoom] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const [inputRoom, setInputRoom] = useState<string>("");

  useEffect(() => {
    const handleUserJoined = (payload: { socketId: string }) => {
      setMessages((prev) => [...prev, `${payload.socketId} joined the room.`]);
    };

    socket.on("userJoined", handleUserJoined);

    return () => {
      socket.off("userJoined", handleUserJoined);
    };
  }, []);

  // Create a room
  const createRoom = () => {
    socket.emit("createRoom", (response: { roomCode: string }) => {
      setJoinedRoom(response.roomCode);
      setMessages([`You created room: ${response.roomCode}`]);
    });
  };

  const joinRoom = () => {
    socket.emit(
      "joinRoom",
      inputRoom.trim(),
      (response: { success?: boolean; roomCode?: string; error?: string }) => {
        if (response.error) {
          alert(response.error);
        } else if (response.roomCode) {
          setJoinedRoom(response.roomCode);
          setMessages([`You joined room: ${response.roomCode}`]);
        }
      }
    );
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Algo Arena Rooms</h1>

      {!joinedRoom ? (
        <>
          <button onClick={createRoom}>Create Room</button>
          <br />
          <br />
          <input
            placeholder="Enter Room Code"
            value={inputRoom}
            onChange={(e) => setInputRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </>
      ) : (
        <>
          <h2>Room: {joinedRoom}</h2>
          <ul>
            {messages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Rooms;
