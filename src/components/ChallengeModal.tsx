import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Typography,
} from "@mui/material";

interface ChallengeModalProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  friends: { id: string; username: string }[];
  friendsLoading: boolean;
  friendsError: string;
  onConfirm: (params: {
    opponentUsername: string;
    difficulty: "easy" | "medium" | "hard";
    durationMin: 5 | 10 | 15;
  }) => void;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({
  open,
  onClose,
  loading,
  friends,
  friendsLoading,
  friendsError,
  onConfirm,
}) => {
  const [opponentUsername, setOpponentUsername] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [durationMin, setDurationMin] = useState<5 | 10 | 15>(5);

  const handleSubmit = () => {
    if (!opponentUsername) return alert("Please choose an opponent.");
    onConfirm({ opponentUsername, difficulty, durationMin });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: "bold" }}>Start a Challenge</DialogTitle>
      <DialogContent dividers>
        {friendsLoading ? (
          <CircularProgress size={24} />
        ) : friendsError ? (
          <Typography color="error">{friendsError}</Typography>
        ) : (
          <>
            <TextField
              select
              label="Opponent"
              value={opponentUsername}
              onChange={(e) => setOpponentUsername(e.target.value)}
              fullWidth
              margin="dense"
            >
              {friends.map((f) => (
                <MenuItem key={f.id} value={f.username}>
                  {f.username}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
              fullWidth
              margin="dense"
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </TextField>

            <TextField
              select
              label="Duration (minutes)"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value) as 5 | 10 | 15)}
              fullWidth
              margin="dense"
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
            </TextField>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || friendsLoading}
        >
          {loading ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChallengeModal;
