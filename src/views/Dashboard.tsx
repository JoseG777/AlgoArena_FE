import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import AlgorithmVortex from "../components/AlgorithmVortex";
import NavBar from "../components/NavBar";
import { useNavigate, Link } from "react-router-dom";
import { socket } from "../lib/socket";

type FriendRow = { id: string; username: string; date: string };

type InviteNotification = {
    roomCode: string;
    inviterUsername: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<"typescript" | "python">("typescript");
  const [creating, setCreating] = useState(false);

  const [openSetup, setOpenSetup] = useState(false);

  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [friendsLoading, setFriendsLoading] = useState<boolean>(true);
  const [friendsErr, setFriendsErr] = useState<string>("");

  const [selectedFriendId, setSelectedFriendId] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [selectedDurationMin, setSelectedDurationMin] = useState<5 | 10 | 15>(5);

  const [invite, setInvite] = useState<InviteNotification | null>(null); 
  const [openInviteDialog, setOpenInviteDialog] = useState(false);

  useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }
  }, []);

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
        if (data.length > 0) setSelectedFriendId(data[0].id);
      } catch (e: any) {
        if (!aborted) setFriendsErr(e?.message || "Could not load friends");
      } finally {
        if (!aborted) setFriendsLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  useEffect(() => {
    socket.on('friendInvited', (data: InviteNotification) => {
        console.log("Received Invitation!", data);
        setInvite(data);
        setOpenInviteDialog(true);
    });

    return () => {
      socket.off('friendInvited');
    };
  }, []);

  function findSelectedFriendUsername(): string | null {
    const f = friends.find((x) => x.id === selectedFriendId);
    return f?.username ?? null;
  }

  const canStart = !friendsLoading && !friendsErr && !!selectedFriendId;

  async function createRoom() {
    if (creating) return;
    setCreating(true);
    try {
      const allowUsername = findSelectedFriendUsername();
      const durationSec = selectedDurationMin * 60;
      const difficulty = selectedDifficulty; 

      const res = await fetch("http://localhost:3001/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          difficulty,
          durationSec,
          allowUsername,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to create room");
      }

      const data = await res.json();
      setOpenSetup(false);
      navigate(`/battle/${encodeURIComponent(data.code)}?lang=${encodeURIComponent(lang)}`);
    } catch (e: any) {
      alert(e?.message || "Could not create room");
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

      <Dialog
        open={openSetup}
        onClose={() => (!creating ? setOpenSetup(false) : undefined)}
        fullWidth
        maxWidth="sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !creating && canStart) {
            e.preventDefault();
            createRoom();
          }
        }}
      >
        <DialogTitle>Start a Coding Battle</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="friend-label">Friend</InputLabel>
              <Select
                labelId="friend-label"
                label="Friend"
                value={selectedFriendId}
                onChange={(e) => setSelectedFriendId(e.target.value as string)}
                disabled={friendsLoading || !!friendsErr}
              >
                {friendsLoading && <MenuItem disabled>Loading…</MenuItem>}
                {friendsErr && <MenuItem disabled>Error loading friends</MenuItem>}
                {!friendsLoading && !friendsErr && friends.length === 0 && (
                  <MenuItem disabled>No friends yet</MenuItem>
                )}
                {!friendsLoading &&
                  !friendsErr &&
                  friends.map((f) => (
                    <MenuItem key={f.id} value={f.id}>
                      {f.username}
                    </MenuItem>
                  ))}
              </Select>
              <Typography variant="caption" sx={{ mt: 0.5 }}>
                Pick a friend to invite.
              </Typography>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="difficulty-label">Difficulty</InputLabel>
              <Select
                labelId="difficulty-label"
                label="Difficulty"
                value={selectedDifficulty}
                onChange={(e) =>
                  setSelectedDifficulty(e.target.value as "easy" | "medium" | "hard")
                }
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="duration-label">Duration</InputLabel>
              <Select
                labelId="duration-label"
                label="Duration"
                value={selectedDurationMin}
                onChange={(e) => setSelectedDurationMin(Number(e.target.value) as 5 | 10 | 15)}
              >
                <MenuItem value={5}>5 minutes</MenuItem>
                <MenuItem value={10}>10 minutes</MenuItem>
                <MenuItem value={15}>15 minutes</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenSetup(false)} disabled={creating}>
            Cancel
          </Button>
          <Button variant="contained" onClick={createRoom} disabled={creating || !canStart}>
            {creating ? "Starting…" : "Start"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openInviteDialog}
        onClose={() => { setOpenInviteDialog(false); setInvite(null); }}
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
                onClick={() => { setOpenInviteDialog(false); setInvite(null); }}
            >
                Decline
            </Button>
            <Button 
                variant="contained" 
                onClick={() => {
                    if (invite) {
                        setOpenInviteDialog(false);
                        navigate(`/battle/${encodeURIComponent(invite.roomCode)}?lang=${encodeURIComponent(lang)}`);
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
