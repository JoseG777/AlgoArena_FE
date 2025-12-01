import { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import AlgorithmVortex from "../../components/AlgorithmVortex";

type Leader = {
  rank: number;
  username: string;
  points: number;
};

type StatsItem = {
  id: string;
  startedAt: string;
  opponentUsername: string | null;
  points: number;
  result: "win" | "loss" | "tie";
};

type StatsResponse = {
  totalPoints: number;
  matches: StatsItem[];
};

const StatsPage: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [err, setErr] = useState<string>("");
  const [view, setView] = useState<"global" | "mystats">("global");
  const [myStats, setMyStats] = useState<StatsResponse | null>(null);
  // const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Load my stats
        const statsRes = await fetch("http://localhost:3001/me/matches", {
          credentials: "include",
        });
        if (!statsRes.ok) throw new Error("Failed to load Stats");
        const statsJson: StatsResponse = await statsRes.json();
        setMyStats(statsJson);

        // Load leaderboard top 5
        const lbRes = await fetch("http://localhost:3001/leaderboard/top", {
          credentials: "include",
        });
        if (!lbRes.ok) throw new Error("Failed to load leaderboard");
        const { top5 } = await lbRes.json();

        // Load my rank
        const rankRes = await fetch("http://localhost:3001/leaderboard/rank", {
          credentials: "include",
        });
        const { rank } = await rankRes.json();
        // setMyRank(rank);

        let finalList = [...top5];

        // Add myself at bottom if I'm not in top 5
        if (!top5.some((u: any) => u.rank === rank)) {
          finalList.push({
            rank: rank,
            username: "You",
            points: statsJson.totalPoints,
          });
        } else {
          // Replace my username in the top 5 with "You"
          finalList = finalList.map((u) => (u.rank === rank ? { ...u, username: "You" } : u));
        }

        setLeaders(finalList);
      } catch (e: any) {
        setErr(e.message || "Error");
      }
    })();
  }, []);

  if (err) return <div>Error: {err}</div>;

  const winCount = myStats?.matches.filter((m) => m.result === "win").length || 0;
  const lossCount = myStats?.matches.filter((m) => m.result === "loss").length || 0;
  const tieCount = myStats?.matches.filter((m) => m.result === "tie").length || 0;

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "#121729ff",
        color: "white",
        overflow: "hidden", // background container doesn't scroll
      }}
    >
      <AlgorithmVortex />

      {/* Scrollable content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <NavBar />

        <Typography
          variant="h4"
          sx={{
            mt: 12,
            mb: 2,
            fontWeight: "bold",
            letterSpacing: 1,
            color: "#38bdf8",
            textAlign: "center",
          }}
        >
          {view === "global" ? "GLOBAL LEADERBOARD" : "MY STATS"}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mb: 4 }}>
          <Button
            onClick={() => setView("global")}
            sx={{
              color: view === "global" ? "#60a5fa" : "#cbd5e1",
              fontWeight: 700,
              textTransform: "uppercase",
              "&:hover": { color: "#93c5fd" },
            }}
          >
            Global
          </Button>
          <Button
            onClick={() => setView("mystats")}
            sx={{
              color: view === "mystats" ? "#60a5fa" : "#cbd5e1",
              fontWeight: 700,
              textTransform: "uppercase",
              "&:hover": { color: "#93c5fd" },
            }}
          >
            My Stats
          </Button>
        </Box>

        {/* GLOBAL VIEW */}
        {view === "global" && (
          <TableContainer
            component={Paper}
            sx={{
              width: "60%",
              backgroundColor: "#1e293b",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 0 20px rgba(30,58,138,0.3)",
              mx: "auto",
              mb: 6,
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
                {leaders.map((player) => (
                  <TableRow
                    key={player.rank}
                    sx={{
                      backgroundColor:
                        player.username === "You" ? "rgba(56,189,248,0.25)" : "rgba(30,41,59,0.5)",
                    }}
                  >
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>{player.rank}</TableCell>
                    <TableCell
                      sx={{
                        color: player.username === "You" ? "#38bdf8" : "white",
                        fontWeight: 600,
                      }}
                    >
                      {player.username}
                    </TableCell>
                    <TableCell sx={{ color: "#38bdf8", fontWeight: "bold" }}>
                      {player.points}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* MY STATS VIEW */}
        {view === "mystats" && myStats && (
          <Box
            sx={{
              width: "80%",
              backgroundColor: "rgba(30,41,59,0.9)",
              borderRadius: 3,
              p: 4,
              mx: "auto",
              mb: 6,
            }}
          >
            <Card
              sx={{
                backgroundColor: "rgba(15,23,42,0.9)",
                borderRadius: 3,
                mb: 4,
                p: 2,
              }}
            >
              <CardContent>
                <Grid container spacing={2} justifyContent="center" textAlign="center">
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h6" sx={{ color: "#38bdf8", fontWeight: "bold" }}>
                      {myStats.totalPoints}
                    </Typography>
                    <Typography sx={{ color: "#cbd5e1" }}>Total Points</Typography>
                  </Grid>
                  <Grid item xs={4} sm={3}>
                    <Typography variant="h6" sx={{ color: "#4ade80", fontWeight: "bold" }}>
                      {winCount}
                    </Typography>
                    <Typography sx={{ color: "#cbd5e1" }}>Wins</Typography>
                  </Grid>
                  <Grid item xs={4} sm={3}>
                    <Typography variant="h6" sx={{ color: "#f87171", fontWeight: "bold" }}>
                      {lossCount}
                    </Typography>
                    <Typography sx={{ color: "#cbd5e1" }}>Losses</Typography>
                  </Grid>
                  <Grid item xs={4} sm={3}>
                    <Typography variant="h6" sx={{ color: "#facc15", fontWeight: "bold" }}>
                      {tieCount}
                    </Typography>
                    <Typography sx={{ color: "#cbd5e1" }}>Ties</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* MATCH HISTORY */}
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: "bold", color: "#60a5fa", textAlign: "center" }}
            >
              Match History
            </Typography>

            <TableContainer component={Paper} sx={{ backgroundColor: "#1e293b" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#111827" }}>
                    <TableCell sx={{ color: "#93c5fd", fontWeight: "bold" }}>DATE</TableCell>
                    <TableCell sx={{ color: "#93c5fd", fontWeight: "bold" }}>OPPONENT</TableCell>
                    <TableCell sx={{ color: "#93c5fd", fontWeight: "bold" }}>RESULT</TableCell>
                    <TableCell sx={{ color: "#93c5fd", fontWeight: "bold" }}>POINTS</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {myStats.matches.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell sx={{ color: "white" }}>
                        {new Date(m.startedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ color: "white" }}>{m.opponentUsername ?? "—"}</TableCell>
                      <TableCell
                        sx={{
                          color:
                            m.result === "win"
                              ? "#4ade80"
                              : m.result === "loss"
                                ? "#f87171"
                                : "#facc15",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                        }}
                      >
                        {m.result}
                      </TableCell>
                      <TableCell sx={{ color: "#38bdf8", fontWeight: "bold" }}>
                        {m.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StatsPage;
