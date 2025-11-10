import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import AlgorithmVortex from "../components/AlgorithmVortex";
import NavBar from "../components/NavBar";
import { useNavigate, Link } from "react-router-dom";
import ChallengeModal from "../components/ChallengeModal";
import { socket } from "../lib/socket";

type FriendRow = { id: string; username: string; date: string };

type InviteNotification = {
  roomCode: string;
  inviterUsername: string;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<"typescript" | "python">("typescript");
  const [creating, setCreating] = useState(false);

  const [openSetup, setOpenSetup] = useState(false);

  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [friendsLoading, setFriendsLoading] = useState<boolean>(true);
  const [friendsErr, setFriendsErr] = useState<string>("");

  const [invite, setInvite] = useState<InviteNotification | null>(null);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);

  // Ensure socket connection
  useEffect(() => {
    if (!socket.connected) socket.connect();
  }, []);

  // Listen for friend invitations
  useEffect(() => {
    const onFriendInvited = (data: InviteNotification) => {
      console.log("Received Invitation!", data);
      setInvite(data);
      setOpenInviteDialog(true);
    };
    socket.on("friendInvited", onFriendInvited);
    return () => {
      socket.off("friendInvited", onFriendInvited);
    };
  }, []);

  // Load friends
  useEffect(() => {
    let aborted = false;
    (async () => {
      setFriendsLoading(true);
      setFriendsErr("");
      try {
        const res = await fetch("http://localhost:3001/friends", { credentials: "include" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || "Failed to load friends");
        }
        const data: FriendRow[] = await res.json();
        if (aborted) return;
        setFriends(data);
      } catch (e: unknown) {
        if (!aborted) {
          const message = e instanceof Error ? e.message : "Could not load friends";
          setFriendsErr(message);
        }
      } finally {
        if (!aborted) setFriendsLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  // Create room using values from ChallengeModal
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
      setOpenSetup(false);
      navigate(`/battle/${encodeURIComponent(data.code)}?lang=${encodeURIComponent(lang)}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Could not create room";
      alert(message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "#0f0f3c",
        color: "white",
        overflow: "hidden",
      }}
    >
      <AlgorithmVortex />
      <NavBar />

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          padding: 4,
        }}
      >
        <Grid container spacing={4} justifyContent="center">
          <Grid item>
            <Button
              variant="contained"
              onClick={() => setOpenSetup(true)}
              disabled={creating}
              sx={{
                width: { xs: 480, sm: 480 },
                height: { xs: 450, sm: 350 },
                backgroundColor: "#1e293b",
                fontWeight: "bold",
                fontSize: { xs: "1.1rem", sm: "1.3rem" },
                display: "flex",
                flexDirection: "column",
                gap: 2,
                borderRadius: 4,
                transition: "transform 0.2s, background-color 0.2s",
                "&:hover": {
                  backgroundColor: "#283549",
                  transform: "scale(1.03)",
                },
              }}
            >
              <CodeIcon sx={{ fontSize: { xs: "3.5rem", sm: "4.5rem" }, color: "#38bdf8" }} />
              {creating ? "CREATING…" : "Coding Challenge"}
            </Button>
          </Grid>

          <Grid item>
            <Button
              component={Link}
              to="/trivia"
              variant="contained"
              sx={{
                width: { xs: 480, sm: 480 },
                height: { xs: 450, sm: 350 },
                backgroundColor: "#1e293b",
                fontWeight: "bold",
                fontSize: { xs: "1.1rem", sm: "1.3rem" },
                display: "flex",
                flexDirection: "column",
                gap: 2,
                borderRadius: 4,
                transition: "transform 0.2s, background-color 0.2s",
                "&:hover": {
                  backgroundColor: "#283549",
                  transform: "scale(1.03)",
                },
              }}
            >
              <LightbulbIcon sx={{ fontSize: { xs: "3.5rem", sm: "4.5rem" }, color: "#f59e0b" }} />
              CS TRIVIA
            </Button>
          </Grid>
        </Grid>

        <div style={{ marginTop: 24 }}>
          <label style={{ marginRight: 8 }}>Language:&nbsp;</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as "typescript" | "python")}
            style={{ padding: 6, borderRadius: 8 }}
          >
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
          </select>
        </div>
      </Box>

      {/* Challenge setup modal */}
      <ChallengeModal
        open={openSetup}
        onClose={() => setOpenSetup(false)}
        loading={creating}
        friends={friends.map(({ id, username }) => ({ id, username }))}
        friendsLoading={friendsLoading}
        friendsError={friendsErr}
        onConfirm={({ opponentUsername, difficulty, durationMin }) =>
          createRoomWith({ opponentUsername, difficulty, durationMin })
        }
      />

      {/* Incoming challenge dialog */}
      <Dialog
        open={openInviteDialog}
        onClose={() => {
          setOpenInviteDialog(false);
          setInvite(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>You've been challenged!</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {invite?.inviterUsername} has challenged you to a coding battle!
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Do you want to accept the challenge and join the room now?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenInviteDialog(false);
              setInvite(null);
            }}
          >
            Decline
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (invite) {
                setOpenInviteDialog(false);
                navigate(
                  `/battle/${encodeURIComponent(invite.roomCode)}?lang=${encodeURIComponent(lang)}`
                );
              }
            }}
          >
            Accept and Join
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
