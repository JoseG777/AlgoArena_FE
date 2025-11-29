import { io } from "socket.io-client";

export const socket = io(`${import.meta.env.VITE_API_URL}`, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
});

socket.on("connect_error", (err) => {
  console.error("socket connect_error:", err.message);
});
