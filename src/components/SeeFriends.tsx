import { useEffect, useState } from "react";
import "../views/FriendsPage.css";

type Friend = {
  id: string;
  username: string;
  date: string;
};

export default function SeeFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  // const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  // const [loading, setLoading] = useState(false);
  // const [activeMenu, setActiveMenu] = useState<string | null>(null);

  async function fetchFriends() {
    // setError("");
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
      // setError(e.message || "Network error");
    } finally {
      // setLoading(false);
    }
  }

  async function removeFriend(username: string) {
    // setError("");
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
      // setError(e.message || "Network error");
    } finally {
      setBusy(null);
    }
  }

  // function confirmAndRemove(username: string) {
  //   const ok = window.confirm(`Are you sure you want to remove @${username} from your friends?`);
  //   if (!ok) return;
  //   removeFriend(username);
  // }

  function handleChallenge(username: string) {
    alert(`Challenge sent to @${username}!`);
  }

  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <div className="friends-container">
      {/* Search bar */}
      <input type="text" placeholder="Search friends" className="friend-search" />

      {/* Friends list */}
      <div className="friends-list">
        {friends.length === 0 ? (
          <p className="no-friends">No friends yet.</p>
        ) : (
          friends.map((f) => (
            <div className="friend-card" key={f.id}>
              <div className="friend-info">
                <img
                  src={`https://ui-avatars.com/api/?name=${f.username}&background=007bff&color=fff`}
                  alt={f.username}
                  className="friend-avatar"
                />
                <span className="friend-name">{f.username}</span>
              </div>

              <button
                className="challenge-btn"
                onClick={() => handleChallenge(f.username)}
                disabled={busy === f.username}
              >
                {busy === f.username ? "Removing..." : "CHALLENGE"}
              </button>
            </div>
          ))
        )}
      </div>

      <button className="refresh-btn" onClick={fetchFriends}>
        Refresh
      </button>
    </div>
  );
}
