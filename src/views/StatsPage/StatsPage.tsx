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
import GlobalLeaderboard from "./globalleaderboard";

type Leader = {
  rank: number;
  username: string;
  points: number;
  isSelf?: boolean;
};

const placeholderLeaders: Leader[] = [
  { rank: 1, username: "Jose", points: 1200 },
  { rank: 2, username: "Prabodh", points: 1100 },
  { rank: 3, username: "William", points: 1050 },
  { rank: 4, username: "Charles", points: 1000 },
  { rank: 5, username: "Darshan", points: 950 },
  { rank: 6, username: "AJ", points: 820 },
  { rank: 7, username: "Grace", points: 790 },
  { rank: 8, username: "Joe", points: 780 },
];

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
  const [view, setView] = useState<"global" | "mystats">("global");

  const [leaders, setLeaders] = useState<Leader[]>(placeholderLeaders);
  const [loadingGlobal, setLoadingGlobal] = useState(false);

  const [myStats, setMyStats] = useState<StatsResponse | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    // Fetch My Stats
    (async () => {
      try {
        const res = await fetch("http://localhost:3001/me/matches", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to load stats");

        const json: StatsResponse = await res.json();
        setMyStats(json);

        const myPoints = json.totalPoints;
        const updated = [
          { rank: 0, username: "You", points: myPoints, isSelf: true },
          ...placeholderLeaders,
        ]
          .sort((a, b) => b.points - a.points)
          .map((player, index) => ({ ...player, rank: index + 1 }));

        setLeaders(updated);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Error");
      }
    })();
  }, []);

  if (err) return <div>Error: {err}</div>;

  const winCount = myStats?.matches.filter((m) => m.result === "win").length ?? 0;
  const lossCount = myStats?.matches.filter((m) => m.result === "loss").length ?? 0;
  const tieCount = myStats?.matches.filter((m) => m.result === "tie").length ?? 0;

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: "#121729",
        position: "relative",
        color: "white",
        overflow: "hidden",
      }}
    >
      <AlgorithmVortex />

      <Box sx={{ position: "relative", zIndex: 2 }}>
        <NavBar />

        {/* Title */}
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

        {/* View Buttons */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mb: 4 }}>
          <Button
            onClick={() => setView("global")}
            sx={{
              color: view === "global" ? "#60a5fa" : "#cbd5e1",
              fontWeight: 700,
              textTransform: "uppercase",
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
            }}
          >
            My Stats
          </Button>
        </Box>

        {/* GLOBAL LEADERBOARD */}
        {view === "global" && (
          <GlobalLeaderboard leaders={leaders} loading={loadingGlobal} />
        )}

        {/* MY STATS */}
        {view === "mystats" && myStats && (
          <Box
            sx={{
              width: "80%",
              backgroundColor: "rgba(30,41,59,0.9)",
              p: 4,
              mx: "auto",
              borderRadius: 3,
            }}
          >
            {/* Summary stats */}
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
                    <Typography sx={{ color: "#38bdf8", fontWeight: "bold" }} variant="h6">
                      {myStats.totalPoints}
                    </Typography>
                    <Typography>Points</Typography>
                  </Grid>
                  <Grid item xs={4} sm={3}>
                    <Typography sx={{ color: "#4ade80", fontWeight: "bold" }} variant="h6">
                      {winCount}
                    </Typography>
                    <Typography>Wins</Typography>
                  </Grid>
                  <Grid item xs={4} sm={3}>
                    <Typography sx={{ color: "#f87171", fontWeight: "bold" }} variant="h6">
                      {lossCount}
                    </Typography>
                    <Typography>Losses</Typography>
                  </Grid>
                  <Grid item xs={4} sm={3}>
                    <Typography sx={{ color: "#facc15", fontWeight: "bold" }} variant="h6">
                      {tieCount}
                    </Typography>
                    <Typography>Ties</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Match History */}
            <Typography
              variant="h6"
              sx={{ mb: 2, textAlign: "center", color: "#60a5fa", fontWeight: "bold" }}
            >
              Match History
            </Typography>

            <TableContainer component={Paper} sx={{ backgroundColor: "#1e293b" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#111827" }}>
                    <TableCell sx={{ color: "#93c5fd" }}>DATE</TableCell>
                    <TableCell sx={{ color: "#93c5fd" }}>OPPONENT</TableCell>
                    <TableCell sx={{ color: "#93c5fd" }}>RESULT</TableCell>
                    <TableCell sx={{ color: "#93c5fd" }}>POINTS</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {myStats.matches.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell sx={{ color: "white" }}>
                        {new Date(m.startedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ color: "white" }}>
                        {m.opponentUsername ?? "—"}
                      </TableCell>
                      <TableCell
                        sx={{
                          color:
                            m.result === "win"
                              ? "#4ade80"
                              : m.result === "loss"
                              ? "#f87171"
                              : "#facc15",
                          fontWeight: "bold",
                        }}
                      >
                        {m.result.toUpperCase()}
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
