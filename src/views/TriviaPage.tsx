import { Box, Button, Typography, Paper, LinearProgress } from "@mui/material";
import { useState } from "react";
import AlgorithmVortex from "../components/AlgorithmVortex";

const TriviaPage: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);


  const question = "Which of the following data structures uses LIFO (Last In, First Out) ? ";
  const options = ["Queue", "Stack", "Heap", "Linked List"];

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        background: "linear-gradient(160deg, #03045E, #000000)",
        display: "flex",
        position: "fixed",
        top: 0,
        left: 0,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        padding: 3,
      }}
    >
         
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#4CC9F0", mb: 4 }}>
        Trivia Arena ⚡
      </Typography>

      {/* Progress Bar */}
      <Box sx={{ width: "80%", maxWidth: 600, mb: 3 }}>
        <LinearProgress variant="determinate" value={40} sx={{ height: 10, borderRadius: 5 }} />
      </Box>
      {/* Question Card */}
      <Paper
        sx={{
          width: "80%",
          maxWidth: 600,
          p: 4,
          backgroundColor: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(76,201,240, 0.4)",
          borderRadius: 3,
          boxShadow: "0 0 20px rgba(76, 201,240, 0.3)",
          textAlign: "center",
        }}
      >
        <Typography variant="h6" sx={{color: "#f1f1f1ff" , mb: 3 }}>
          {question}
        </Typography>

        {options.map((option) => (
          <Button
            key={option}
            variant="outlined"
            onClick={() => setSelectedOption(option)}
            sx={{
              mb: 2,
              width: "100%",
              color: selectedOption === option ? "#000" : "#4CC9F0",
              backgroundColor: selectedOption === option ? "#4CC9F0" : "transparent",
              borderColor: "#4CC9F0",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#4CC9F0",
                color: "#000",
              },
            }}
          >
            {option}
          </Button>
        ))}
      </Paper>

      {/* Next Question Button */}
      <Button
        variant="contained"
        sx={{
          mt: 4,
          px: 4,
          py: 1.5,
          backgroundColor: "#7209B7",
          "&:hover": { backgroundColor: "#560BAD" },
          borderRadius: "30px",
          fontWeight: "bold",
        }}
      >
        Next question →
      </Button>
    </Box>
  );
};
export default TriviaPage;
