import React, { useEffect, useState } from "react";
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

type ChallengeModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (opts: {
    opponentUsername: string;
    difficulty: "easy" | "medium" | "hard";
    durationMin: number;
  }) => void;
  friends?: Array<{ id: string; username: string }>;
  opponentUsername?: string;
  loading?: boolean;
};

const ChallengeModal: React.FC<ChallengeModalProps> = ({
  open,
  onClose,
  onConfirm,
  friends = [],
  opponentUsername,
  loading = false,
}) => {
  const [selectedFriend, setSelectedFriend] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [durationMin, setDurationMin] = useState<5 | 10 | 15>(5);

  useEffect(() => {
    if (opponentUsername) setSelectedFriend(opponentUsername);
  }, [opponentUsername]);

  const handleStart = () => {
    const username = opponentUsername || selectedFriend;
    if (!username) return alert("Please choose a friend to challenge.");
    onConfirm({ opponentUsername: username, difficulty, durationMin });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundColor: "#1e1e2f",
          color: "white",
          borderRadius: 3,
        },
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
            <FormControl fullWidth variant="outlined">
              <InputLabel id="friend-label" sx={{ color: "#bbb" }}>
                Friend
              </InputLabel>
              <Select
                labelId="friend-label"
                value={selectedFriend}
                label="Friend"
                onChange={(e) => setSelectedFriend(e.target.value)}
                sx={{
                  backgroundColor: "#2a2a45",
                  color: "white",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#444",
                  },
                }}
              >
                {friends.length === 0 ? (
                  <MenuItem disabled>No friends found</MenuItem>
                ) : (
                  friends.map((f) => (
                    <MenuItem key={f.id} value={f.username}>
                      {f.username}
                    </MenuItem>
                  ))
                )}
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
              onChange={(e) => setDifficulty(e.target.value as any)}
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

          {/* Duration */}
          <FormControl fullWidth variant="outlined">
            <InputLabel id="duration-label" sx={{ color: "#bbb" }}>
              Duration
            </InputLabel>
            <Select
              labelId="duration-label"
              value={durationMin}
              label="Duration"
              onChange={(e) => setDurationMin(Number(e.target.value) as any)}
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
          onClick={onClose}
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
          disabled={loading}
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
