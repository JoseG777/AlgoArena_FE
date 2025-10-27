import React from "react";
import { AppBar, Toolbar, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NavBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "transparent",
        padding: "0.25rem 1.5rem",
        marginTop: "-1.5rem",  
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Algo Arena Logo"
            sx={{
              width: { xs: 120, sm: 160, md: 180 },
              filter: "drop-shadow(0px 0px 6px rgba(0, 150, 255, 0.5))",
            }}
          />
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          <Button
            color="inherit"
            sx={{ fontWeight: "bold", fontSize: "1.2rem" }}
            onClick={() => navigate("/dash-board")}
          >
            HOME
          </Button>

          <Button
            color="inherit"
            sx={{ fontWeight: "bold", fontSize: "1.2rem" }}
          >
            STATS
          </Button>

          <Button
            color="inherit"
            sx={{ fontWeight: "bold", fontSize: "1.2rem" }}
          >
            FRIENDS
          </Button>

          <Button
            color="inherit"
            sx={{ fontWeight: "bold", fontSize: "1.2rem" }}
          >
            LOGOUT
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
