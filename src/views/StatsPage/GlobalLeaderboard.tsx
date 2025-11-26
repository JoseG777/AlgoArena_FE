import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

type Leader = {
  rank: number;
  username: string;
  points: number;
  isSelf?: boolean;
};

interface Props {
  leaders: Leader[];
  loading: boolean;
}

export default function GlobalLeaderboard({ leaders, loading }: Props) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        width: "60%",
        maxHeight: "500px",
        overFlowY: "auto",
        backgroundColor: "rgba(30,41,59,0.9)",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 0 20px rgba(30,58,138,0.3)",
        mx: "auto",
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#111827" }}>
            <TableCell sx={{ color: "#93c5fd", fontWeight: "bold" }}>#</TableCell>
            <TableCell sx={{ color: "#93c5fd", fontWeight: "bold" }}>USERNAME</TableCell>
            <TableCell sx={{ color: "#93c5fd", fontWeight: "bold" }}>POINTS</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} sx={{ textAlign: "center", color: "white" }}>
                Loading leaderboard…
              </TableCell>
            </TableRow>


          ) : (
            leaders.map((player) => (
              <TableRow
                key={player.rank}
                sx={{
                  backgroundColor: player.rank === 1
                    ? "rgba(79,70,229,0.35)"
                    : player.isSelf
                    ? "rgba(56,189,248,0.25)"
                    : "rgba(15,23,42,0.95)",

                  ...(player.rank === 1 && {
                    animation: "glowPulse 1.8s ease-in-out infinite",
                    "@keyframes glowPulse": {
                      "0%": { boxShadow: "0 0 0 rgba(129,140,248,0.0)" },
                      "50%": { boxShadow: "0 0 25px rgba(129,140,248,0.9)" },
                      "100%": { boxShadow: "0 0 0 rgba(129,140,248,0.0)" },
                    },
                  }),
                }}
              >
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  {player.rank}
                </TableCell>
                <TableCell
                  sx={{
                    color: player.isSelf ? "#38bdf8" : "white",
                    fontWeight: player.isSelf ? 700 : 600,
                  }}
                >
                  {player.username}
                </TableCell>
                <TableCell sx={{ color: "#38bdf8", fontWeight: "bold" }}>
                  {player.points}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
