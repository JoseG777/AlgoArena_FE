import { useEffect, useState } from "react";

type FriendRequest = {
  id: string;
  requesterId: string;
  requesterUsername: string;
  recipientId: string;
  status: string;
};

export default function SeeFriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function fetchIncoming() {
    setError("");
    try {
      const res = await fetch("http://localhost:3001/friend-requests/incoming?status=pending", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load friend requests");
      setRequests(data);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("Network error");
    }
  }

  async function accept(id: string) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`http://localhost:3001/friend-requests/${id}/accept`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept");
      await fetchIncoming();
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("Network error");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`http://localhost:3001/friend-requests/${id}/reject`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject");
      await fetchIncoming();
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("Network error");
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    fetchIncoming();
  }, []);

  return (
    <div>
      <h2>Incoming Friend Requests</h2>
      {error && <p>{error}</p>}

      {requests.length === 0 ? (
        <p>No pending friend requests.</p>
      ) : (
        <ul>
          {requests.map((r) => (
            <li key={r.id}>
              From: @{r.requesterUsername} ({r.status}){" "}
              <button onClick={() => accept(r.id)} disabled={busyId === r.id}>
                Accept
              </button>{" "}
              <button onClick={() => reject(r.id)} disabled={busyId === r.id}>
                Reject
              </button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={fetchIncoming}>Refresh</button>
    </div>
  );
}
