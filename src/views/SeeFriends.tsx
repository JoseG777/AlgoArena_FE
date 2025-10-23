import { useEffect, useState } from "react";

type Friend = {
  id: string;
  username: string;
};

export default function SeeFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [error, setError] = useState("");

  async function fetchFriends() {
    setError("");
    try {
      const res = await fetch("http://localhost:3001/friends", {
        credentials: "include", 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load friends");
      setFriends(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Network error");
    }
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
            <li key={f.id}>@{f.username}</li>
          ))}
        </ul>
      )}

      <button onClick={fetchFriends}>Refresh</button>
    </div>
  );
}
