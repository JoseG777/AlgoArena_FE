import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Container,
  InputAdornment,
  Collapse,
  CircularProgress,
} from "@mui/material";
import PersonOutline from "@mui/icons-material/PersonOutline";
import MailOutline from "@mui/icons-material/MailOutline";
import LockOutlined from "@mui/icons-material/LockOutlined";
import logo from "../assets/algo.png";
import AlgorithmVortex from "../components/AlgorithmVortex";

interface SignUpFormData {
  username: string;
  email: string;
  password: string; // In the backend the corresponding field is passwordHash. The users password is hashed in the backend
  confirmedPassword: string;
}

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    username: "",
    email: "",
    password: "",
    confirmedPassword: "",
  });

  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target; // this will pull fields from the <input.../> part of the form, we can deconstruct and pull specific values
    setFormData((prev) => ({ ...prev, [name]: value }));
    // console.log(formData);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (formData.password !== formData.confirmedPassword) {
      setError("Passwords do not match!");
      return;
    }
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.toLowerCase(),
          email: formData.email.toLowerCase(),
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong!");
        return;
      }
      setSuccess("User Created successfully");
      setFormData({ username: "", email: "", password: "", confirmedPassword: "" });
    } catch (err) {
      console.error(err);
    } finally {
        setIsLoading(false);
    }
  };
  // Custom styles for the text fields to achieve the desired look
  const textFieldStyles = {
    "& .MuiInputBase-root": {
      backgroundColor: "#111827", // bg-gray-900
      borderRadius: "8px",
      color: "#E5E7EB", // text-gray-200
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#4B5563", // border-gray-600
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#3B82F6", // border-blue-500
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#3B82F6", // border-blue-500
        borderWidth: "2px",
      },
    },
    "& .MuiInputAdornment-root .MuiSvgIcon-root": {
      color: "#9CA3AF", // text-gray-400
    },
    "input::placeholder": {
      color: "#6B7280", // placeholder-gray-500
      opacity: 1,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
  };

  const alertStyles = {
    bgcolor: "transparent",
    fontWeight: "bold",
    letterSpacing: "0.05em",
    border: "none",
    textAlign: "center",
    boxShadow: "none",
  };

  return (
    <Box
      sx={{
        position: "fixed",
        left: "0",
        top: "0",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#111827",
        color: "#E5E7EB",
        display: "flex",

        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        p: 2,
      }}
    >
      <AlgorithmVortex />
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1, mb: 3 }}>
          <Box
            sx={{
              display: "inline-flex",
              bgcolor: "#1F2937",
              p: 2,
              borderRadius: "50%",
              mb: 2,
              width: "255px",
              height: "235px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={logo}
              alt="Algo Arena Logo"
              style={{
                width: "300px",
                height: "300px",
                objectFit: "contain",
                borderRadius: "50%",
              }}
            />
          </Box>
        </Box>

        {/* Title and Subtitle */}
        <Box sx={{ textAlign: "center", mb: 4 }}></Box>

        {/* Form Container */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            bgcolor: "rgba(31, 41, 55, 0.6)",
            backdropFilter: "blur(10px)",
            p: 4,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "#4B5563",
            boxShadow: "0 10px 30px rgba(59, 130, 246, 0.1)",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              fullWidth
              sx={textFieldStyles}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              sx={textFieldStyles}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutline />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
              sx={textFieldStyles}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              type="password"
              name="confirmedPassword"
              placeholder="Confirm Password"
              value={formData.confirmedPassword}
              onChange={handleChange}
              required
              fullWidth
              sx={textFieldStyles}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box
            sx={{
              height: 40,
              mt: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Collapse in={!!error}>
              <Alert severity="error" sx={{ ...alertStyles, color: "#F87171" }}>
                {error}
              </Alert>
            </Collapse>
            <Collapse in={!!success}>
              <Alert severity="success" sx={{ ...alertStyles, color: "#4ADE80" }}>
                {success}
              </Alert>
            </Collapse>
          </Box>

          <Button
            type="submit"
            disabled={isLoading}
            fullWidth
            variant="contained"
            sx={{
              mt: 1,
              py: 1.5,
              bgcolor: "#DC2626",
              borderRadius: "8px",
              fontWeight: "bold",
              letterSpacing: "0.1em",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "#B91C1C",
                transform: "scale(1.05)",
              },
              "&.Mui-disabled": {
                bgcolor: "rgba(220, 38, 38, 0.5)",
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Enter"}
          </Button>
        </Box>
        <Typography sx={{ textAlign: "center", fontSize: "0.75rem", color: "#6B7280", mt: 4 }}>
          Already have an account?{" "}
          <a href="#" style={{ color: "#60A5FA", textDecoration: "none" }}>
            Log In
          </a>
        </Typography>
      </Container>
    </Box>
  );
};

export default SignUp;
