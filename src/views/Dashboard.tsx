import React from "react";
import { Box, Button, Grid } from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import AlgorithmVortex from "../components/AlgorithmVortex";
import NavBar from "../components/NavBar";
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
      <NavBar />

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
