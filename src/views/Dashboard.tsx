import React from "react";
import { Box, Button, Grid, AppBar, Toolbar } from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import AlgorithmVortex from "../components/AlgorithmVortex";
import { useNavigate, Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

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
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: "transparent", padding: "0.5rem 2rem" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Logo and Title */}

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Algo Arena Logo"
              sx={{
                width: { xs: 350, sm: 250 },
                filter: "drop-shadow(0px 0px 8px rgba(0, 150, 255, 0.6))",
              }}
            />
            <Box></Box>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            <Button
              sx={{ fontWeight: "bold", fontSize: "1.2rem" }}
              onClick={() => navigate("/dash-board")}
            >
              HOME
            </Button>
            <Button color="inherit" sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
              STATS
            </Button>
            <Button color="inherit" sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
              FRIENDS
            </Button>
            <Button color="inherit" sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
              LOGOUT
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content: Centered */}
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
        {/* Feature Buttons */}
        <Grid container spacing={4} justifyContent="center">
          <Grid item>
            <Button
              variant="contained"
              onClick={() => navigate("/test-judge")}
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
              Coding Challenge
            </Button>
          </Grid>
          <Grid item>
            <Button
              component={Link}
              to="/trivia"
              variant="contained"
              onClick={() => navigate("/trivia")}
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

        {/* Create Room Button */}
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#7c3aed",
            "&:hover": { backgroundColor: "#6d28d9" },
            width: { xs: "80%", sm: "auto" },
            px: 12,
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: "bold",
            borderRadius: "12px",
            boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)",
          }}
        >
          <Link to="/auth-room">CREATE ROOM</Link>
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;
