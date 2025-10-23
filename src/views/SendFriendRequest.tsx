import { useState } from "react";

export default function SendFriendRequest() {
  const [recipientUsername, setRecipientUsername] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:3001/friend-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ recipientUsername }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to send request");
        return;
      }

      setMessage(`Friend request sent to ${data.recipientUsername}`);
      setRecipientUsername("");
    } catch (err) {
      console.error(err);
      setMessage("Network error");
    }
  }

  return (
    <div>
      <h2>Send Friend Request</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Recipient Username:
          <input
            type="text"
            value={recipientUsername}
            onChange={(e) => setRecipientUsername(e.target.value)}
            required
          />
        </label>
        <button type="submit">Send</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
