import React from "react";
import { AppBar, Toolbar, Box, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:3001/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        localStorage.clear();
        sessionStorage.clear();

        window.location.href = "/";
      } else {
        console.error("Logout failed:", await res.text());
      }
    } catch (err) {
      console.error("Logout request error:", err);
    }
  };

  const navItems = [
    { label: "Home", path: "/dash-board" },
    { label: "Stats", path: "/stats" },
    { label: "Friends", path: "/friends" },
  ];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        top: 0,
        left: 0,
        width: "100%",
        height: "100px",
        backgroundColor: "rgba(10, 15, 25, 0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "0.25rem 1.5rem",
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
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
          {[
            { label: "Home", path: "/dash-board" },
            { label: "Stats", path: "/stats" },
            { label: "Friends", path: "/friends" },
          ].map((item) => (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                position: "relative",
                color: "#e2e8f0",
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                letterSpacing: "0.5px",
                padding: "6px 10px",
                transition: "color 0.25s ease",

                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "0%",
                  height: "2px",
                  backgroundColor: "#60a5fa",
                  transition: "width 0.3s ease",
                  borderRadius: "2px",
                },

                "&:hover": {
                  color: "#60a5fa",
                  background: "transparent",
                },
                "&:hover::after": {
                  width: "100%",
                },
              }}
            >
              {item.label}
            </Button>
          ))}

          {/* Logout Button*/}
          <Button
            onClick={handleLogout}
            sx={{
              position: "relative",
              color: "#f87171",
              fontWeight: 600,
              fontSize: "1rem",
              textTransform: "none",
              letterSpacing: "0.5px",
              padding: "6px 10px",
              transition: "color 0.25s ease",

              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "0%",
                height: "2px",
                backgroundColor: "#ef4444",
                transition: "width 0.3s ease",
                borderRadius: "2px",
              },

              "&:hover": {
                color: "#ef4444",
                background: "transparent",
              },
              "&:hover::after": {
                width: "100%",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
