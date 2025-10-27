import { useEffect, useState } from "react";

type Friend = {
  id: string;
  username: string;
  date: string;
};

export default function SeeFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function fetchFriends() {
    setError("");
    try {
      const res = await fetch("http://localhost:3001/friends", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load friends");
      setFriends(data);
      console.log(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Network error");
    }
  }

  async function removeFriend(username: string) {
    setError("");
    setBusy(username);
    try {
      const res = await fetch(`http://localhost:3001/friends/${encodeURIComponent(username)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove friend");

      setFriends((prev) => prev.filter((f) => f.username !== username));
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Network error");
    } finally {
      setBusy(null);
    }
  }

  function confirmAndRemove(username: string) {
    const ok = window.confirm(`Are you sure you want to remove @${username} from your friends?`);
    if (!ok) return;
    removeFriend(username);
  }
  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <div>
      <h2>Your Friends</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {friends.length === 0 ? (
        <p>No friends yet.</p>
      ) : (
        <ul>
          {friends.map((f) => (
            <li key={f.id}>
              @{f.username} | {f.date}
              <button onClick={() => confirmAndRemove(f.username)} disabled={busy === f.username}>
                {busy === f.username ? "Removing..." : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={fetchFriends}>Refresh</button>
    </div>
  );
}
