import { useEffect, useState } from "react";
import "../FriendsPage.css";
import { socket } from "../lib/socket";
import ChallengeModal from "../components/ChallengeModal";

type Friend = {
  id: string;
  username: string;
  date: string;
};

export default function SeeFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [challenging, setChallenging] = useState(false);
  const [loading, setLoading] = useState(false);

  // Challenge Modal

  const [openChallenge, setOpenChallenge] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  async function fetchFriends() {
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/friends", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load friends");
      setFriends(data);
      console.log(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function removeFriend(username: string) {
    setError("");
    setRemoving(username);
    try {
      const res = await fetch(`http://localhost:3001/api/friends/${encodeURIComponent(username)}`, {
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
      setRemoving(null);
    }
  }

  function confirmAndRemove(username: string) {
    const ok = window.confirm(`Are you sure you want to remove @${username} from your friends?`);
    if (!ok) return;
    removeFriend(username);
  }

  function handleOpenChallenge(username: string) {
    setSelectedFriend(username);
    setOpenChallenge(true);
  }

  async function handleConfirmChallenge(config: {
    opponentUsername: string;
    difficulty: "easy" | "medium" | "hard";
    durationMin: number;
  }) {
    setChallenging(true);
    try {
      const res = await fetch("http://localhost:3001/api/challenge/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(config),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to start challenge");
        return;
      }

      window.location.href = `/battle/${encodeURIComponent(data.roomCode)}?lang=typescript`;
    } catch (err) {
      console.error("Challenge error:", err);
      alert("Something went wrong while starting the challenge");
    } finally {
      setChallenging(false);
    }
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
                onClick={() => handleOpenChallenge(f.username)}
                disabled={challenging}
              >
                {challenging ? "Challenging..." : "CHALLENGE"}
              </button>
            </div>
          ))
        )}
      </div>

      <button className="refresh-btn" onClick={fetchFriends}>
        Refresh
      </button>
      <ChallengeModal
        open={openChallenge}
        onClose={() => setOpenChallenge(false)}
        onConfirm={handleConfirmChallenge}
        opponentUsername={selectedFriend ?? undefined}
        loading={challenging}
      />
    </div>
  );
}
