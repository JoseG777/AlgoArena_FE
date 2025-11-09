import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChallengeModal from "./ChallengeModal";
import "../views/FriendsPage/FriendsPage.css";

type Friend = {
  id: string;
  username: string;
  date: string;
};

export default function SeeFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [openForUsername, setOpenForUsername] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  async function fetchFriends() {
    try {
      const res = await fetch("http://localhost:3001/friends", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load friends");
      setFriends(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function removeFriend(username: string) {
    setBusy(username);
    try {
      const res = await fetch(`http://localhost:3001/friends/${encodeURIComponent(username)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove friend");
      setFriends((prev) => prev.filter((f) => f.username !== username));
      setActiveMenu(null);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(null);
    }
  }

  function confirmAndRemove(username: string) {
    const ok = window.confirm(`Are you sure you want to remove @${username} from your friends?`);
    if (!ok) return;
    removeFriend(username);
  }

  function handleChallenge(username: string) {
    setActiveMenu(null);
    setOpenForUsername(username);
  }

  async function createRoomWith({
    opponentUsername,
    difficulty,
    durationMin,
  }: {
    opponentUsername: string;
    difficulty: "easy" | "medium" | "hard";
    durationMin: 5 | 10 | 15;
  }) {
    if (creating) return;
    setCreating(true);
    try {
      const durationSec = durationMin * 60;

      const res = await fetch("http://localhost:3001/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          difficulty,
          durationSec,
          allowUsername: opponentUsername,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to create room");
      }

      const data = await res.json();
      setOpenForUsername(null);
      const lang = "typescript";
      navigate(`/battle/${encodeURIComponent(data.code)}?lang=${encodeURIComponent(lang)}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not create room";
      alert(message);
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!popupRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!popupRef.current.contains(e.target)) setActiveMenu(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveMenu(null);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

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
          friends.map((f) => {
            const isBusy = busy === f.username;
            const isOpen = activeMenu === f.username;
            return (
              <div className="friend-card" key={f.id}>
                <div className="friend-info">
                  <img
                    src={`https://ui-avatars.com/api/?name=${f.username}&background=007bff&color=fff`}
                    alt={f.username}
                    className="friend-avatar"
                  />
                  <span className="friend-name">@{f.username}</span>
                </div>

                <div
                  className="friend-actions"
                  style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}
                >
                  <button
                    className="challenge-btn"
                    onClick={() => handleChallenge(f.username)}
                    disabled={isBusy}
                  >
                    {isBusy ? "Working..." : "CHALLENGE"}
                  </button>

                  {/* kebab menu */}
                  <button
                    type="button"
                    className="kebab-btn clickable"
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    title="More actions"
                    onClick={() => setActiveMenu((cur) => (cur === f.username ? null : f.username))}
                  >
                    ⋯
                  </button>

                  {/* popup menu */}
                  {isOpen && (
                    <div ref={popupRef} className="friend-popup" role="menu">
                      <button
                        className="remove-btn"
                        onClick={() => confirmAndRemove(f.username)}
                        disabled={isBusy}
                        role="menuitem"
                      >
                        {isBusy ? "Removing..." : "Remove Friend"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <button className="refresh-btn" onClick={fetchFriends}>
        Refresh
      </button>

      <ChallengeModal
        open={!!openForUsername}
        onClose={() => setOpenForUsername(null)}
        onConfirm={({ opponentUsername, difficulty, durationMin }) =>
          createRoomWith({ opponentUsername, difficulty, durationMin })
        }
        opponentUsername={openForUsername ?? undefined}
        loading={creating}
      />
    </div>
  );
}
