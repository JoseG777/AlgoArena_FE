import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.tsx";
import { Box, TextField, Button, Typography, Paper, Link } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import AlgorithmVortex from "../components/AlgorithmVortex";

interface LoginFormData {
  identifyingInput: string;
  password: string;
}

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    identifyingInput: "",
    password: "",
  });

  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Login failed");
        return;
      }

      await refreshUser();
      navigate("/test");

      setMessage(data.message || "Login successful!");
    } catch (err) {
      console.error(err);
      setMessage("Network error");
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        background: "linear-gradient(160deg, #03045E, #000000)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <AlgorithmVortex />
      {/* LOGO */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Algo Arena Logo"
          sx={{
            width: { xs: "300px", sm: "580px", md: "520px" },
            filter: "drop-shadow(0px 0px 10px rgba(76, 201, 240, 0.8))",
          }}
        />
      </Box>
      {/* Login box */}
      <Paper
        elevation={10}
        sx={{
          width: "90%",
          maxWidth: 400,
          padding: 4,
          borderRadius: 3,
          background: "rgba(0, 0, 0, 0.7)",
          border: "1px solid rgba(76, 201, 240, 0.4)",
          boxShadow: "0 0 20px rgba(76, 201, 240, 0.4)",
          backdropFilter: "blur(8px)",
          textAlign: "center",
          transform: "translateY(-90px)",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* USERNAME */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 1,
              border: "1px solid rgba(76, 201, 240, 0.7)",
              borderRadius: "10px",
              paddingX: 1.5,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            <PersonIcon sx={{ color: "#4CC9F0" }} />
            <TextField
              fullWidth
              placeholder="USERNAME"
              name="identifyingInput"
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: { color: "#fff", fontWeight: "bold" },
              }}
              value={formData.identifyingInput}
              onChange={handleChange}
              required
            />
          </Box>
          {/* PASSWORD */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 1,
              border: "1px solid rgba(76, 201, 240, 0.7)",
              borderRadius: "10px",
              paddingX: 1.5,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            <LockIcon sx={{ color: "#4CC9F0" }} />
            <TextField
              fullWidth
              placeholder="PASSWORD"
              name="password"
              type="password"
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: { color: "#fff", fontWeight: "bold" },
              }}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Box>

          {/* ENTER BUTTON */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              py: 1.2,
              borderRadius: "10px",
              backgroundColor: "#FF0000",
              color: "#fff",
              fontWeight: "bold",
              letterSpacing: 1,
              "&:hover": {
                backgroundColor: "#C1121F",
                transform: "scale(1.02)",
                transition: "0.3s",
              },
            }}
          >
            ENTER ARENA
          </Button>
          {/* ERROR / SUCCESS MESSAGE */}
          {message && (
            <Typography
              variant="body2"
              sx={{
                color: message.includes("success") ? "green" : "error.main",
                mt: 1,
              }}
            >
              {message}
            </Typography>
          )}
        </Box>
        {/* FOOTER LINK */}
        <Typography variant="body2" sx={{ mt: 3, color: "#a3bffa", fontSize: "0.85rem" }}>
          Don't have an account?{" "}
          <Link href="/sign-up" underline="hover" sx={{ color: "#4CC9F0" }}>
            Sign Up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignIn;
