import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";

type Friend = { id: string; username: string };

type ChallengeModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (opts: {
    opponentUsername: string;
    difficulty: "easy" | "medium" | "hard";
    durationMin: 5 | 10 | 15;
  }) => void;
  friends?: Friend[];
  /** If you already know who the opponent is (e.g. from a profile route), pass their username to skip the friend picker. */
  opponentUsername?: string;
  /** Disable closing & start button while async work is happening. */
  loading?: boolean;
  /** Optional states to mirror the old Dashboard behavior. */
  friendsLoading?: boolean;
  friendsError?: string;
};

const ChallengeModal: React.FC<ChallengeModalProps> = ({
  open,
  onClose,
  onConfirm,
  friends = [],
  opponentUsername,
  loading = false,
  friendsLoading = false,
  friendsError = "",
}) => {
  const [selectedFriend, setSelectedFriend] = useState<string>(""); // stores a username
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [durationMin, setDurationMin] = useState<5 | 10 | 15>(5);

  // Compute whether we can start.
  const effectiveUsername = opponentUsername || selectedFriend;
  const canStart = !!effectiveUsername && !loading;

  // When the dialog opens (or friends list / opponent changes), choose a default.
  useEffect(() => {
    if (!open) return;
    if (opponentUsername) {
      setSelectedFriend(opponentUsername);
      return;
    }
    if (friends.length > 0) {
      setSelectedFriend(friends[0].username);
    } else {
      setSelectedFriend("");
    }
  }, [open, opponentUsername, friends]);

  const handleStart = () => {
    const username = opponentUsername || selectedFriend;
    if (!username) {
      alert("Please choose a friend to challenge.");
      return;
    }
    onConfirm({ opponentUsername: username, difficulty, durationMin });
  };

  const handleSafeClose = () => {
    if (!loading) onClose();
  };

  // Friend options content (mirrors the original Dashboard UX).
  const friendMenuItems = useMemo(() => {
    if (friendsLoading) return <MenuItem disabled>Loading…</MenuItem>;
    if (friendsError) return <MenuItem disabled>Error loading friends</MenuItem>;
    if (friends.length === 0) return <MenuItem disabled>No friends yet</MenuItem>;
    return friends.map((f) => (
      <MenuItem key={f.id} value={f.username}>
        {f.username}
      </MenuItem>
    ));
  }, [friendsLoading, friendsError, friends]);

  return (
    <Dialog
      open={open}
      onClose={handleSafeClose}
      fullWidth
      maxWidth="sm"
      disableEscapeKeyDown={loading}
      PaperProps={{
        sx: {
          backgroundColor: "#1e1e2f",
          color: "white",
          borderRadius: 3,
        },
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && canStart) {
          e.preventDefault();
          handleStart();
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.3rem" }}>
        {opponentUsername ? `Challenge @${opponentUsername}` : "Start a Coding Battle"}
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: 3,
          backgroundColor: "#121225",
        }}
      >
        <Stack spacing={3}>
          {!opponentUsername && (
            <FormControl fullWidth variant="outlined" disabled={friendsLoading || !!friendsError}>
              <InputLabel id="friend-label" sx={{ color: "#bbb" }}>
                Friend
              </InputLabel>
              <Select
                labelId="friend-label"
                value={selectedFriend}
                label="Friend"
                onChange={(e) => setSelectedFriend(e.target.value as string)}
                sx={{
                  backgroundColor: "#2a2a45",
                  color: "white",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#444",
                  },
                }}
              >
                {friendMenuItems}
              </Select>
              <Typography variant="caption" sx={{ mt: 0.5, color: "#aaa" }}>
                Pick a friend to invite.
              </Typography>
            </FormControl>
          )}

          <FormControl fullWidth variant="outlined">
            <InputLabel id="difficulty-label" sx={{ color: "#bbb" }}>
              Difficulty
            </InputLabel>
            <Select
              labelId="difficulty-label"
              value={difficulty}
              label="Difficulty"
              onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
              sx={{
                backgroundColor: "#2a2a45",
                color: "white",
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#444",
                },
              }}
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined">
            <InputLabel id="duration-label" sx={{ color: "#bbb" }}>
              Duration
            </InputLabel>
            <Select
              labelId="duration-label"
              value={durationMin}
              label="Duration"
              onChange={(e) => setDurationMin(Number(e.target.value) as 5 | 10 | 15)}
              sx={{
                backgroundColor: "#2a2a45",
                color: "white",
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#444",
                },
              }}
            >
              <MenuItem value={5}>5 minutes</MenuItem>
              <MenuItem value={10}>10 minutes</MenuItem>
              <MenuItem value={15}>15 minutes</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: "#121225",
          px: 3,
          py: 2,
          borderTop: "1px solid #333",
        }}
      >
        <Button
          onClick={handleSafeClose}
          disabled={loading}
          sx={{
            color: "#ccc",
            "&:hover": { backgroundColor: "#222" },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleStart}
          disabled={!canStart}
          sx={{
            backgroundColor: "#7c3aed",
            "&:hover": { backgroundColor: "#6d28d9" },
            px: 4,
            fontWeight: "bold",
          }}
        >
          {loading ? "Starting…" : "Start"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChallengeModal;
