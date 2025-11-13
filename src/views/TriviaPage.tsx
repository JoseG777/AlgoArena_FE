import { Box, Button, Typography, Paper, LinearProgress, CircularProgress } from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import AlgorithmVortex from "../components/AlgorithmVortex";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  category?: string;
  difficulty?: string;
}

const TriviaPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  // --- Fetch questions once ---
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("http://localhost:3001/trivia");
        if (res.data.success && res.data.data.length > 0) {
          setQuestions(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching trivia:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const currentQuestion = questions[currentIndex];

  // --- Stable memoized options ---
  const options = useMemo(() => {
    return currentQuestion?.options || [];
  }, [currentQuestion]);

  const handleAnswerSelect = (option: string) => {
    setSelectedOption(option);
    if (option === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setShowPopup(true);
    }
  };

  // --- Loading state ---
  if (loading) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "radial-gradient(circle at center, #03045E 0%, #000 100%)",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // --- No questions fallback ---
  if (!currentQuestion) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "radial-gradient(circle at center, #03045E 0%, #000 100%)",
          color: "white",
          fontSize: "1.5rem",
        }}
      >
        No questions available.
      </Box>
    );
  }

  // --- UI ---
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
        overflowY: "auto",
      }}
    >
      <AlgorithmVortex/>

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 4,
          zIndex: 1,
        }}
        >

      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#4CC9F0", mb: 3 }}>
        Trivia Arena ⚡
      </Typography>

      <Box sx={{ width: "80%", maxWidth: 600, mb: 3 }}>
        <LinearProgress
          variant="determinate"
          value={((currentIndex + 1) / questions.length) * 100}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: "rgba(255,255,255,0.1)",
            "& .MuiLinearProgress-bar": { backgroundColor: "#4CC9F0" },
          }}
        />
      </Box>

      <Paper
        sx={{
          width: "80%",
          maxWidth: 600,
          p: 4,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          border: "1px solid rgba(76, 201, 240, 0.4)",
          borderRadius: 3,
          boxShadow: "0 0 20px rgba(76, 201, 240, 0.3)",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            color: "#E0E0E0",
            fontWeight: "bold",
            textShadow: "0 0 10px rgba(255, 215, 0, 0.6)",
          }}
        >
          {currentQuestion.question}
        </Typography>

        {options.map((option) => (
          <Button
            key={option}
            onClick={() => handleAnswerSelect(option)}
            disableElevation
            sx={{
              mb: 2,
              width: "100%",
              height: 56,
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "#4CC9F0",
              backgroundColor: selectedOption === option ? "#4CC9F0" : "transparent",
              color: selectedOption === option ? "#000" : "#4CC9F0",
              fontWeight: "bold",
              fontSize: "1rem",
              textTransform: "none",
              transition: "background-color 0.2s, color 0.2s",
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

      <Button
        variant="contained"
        onClick={handleNext}
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
        {currentIndex + 1 < questions.length ? "Next Question →" : "See Results"}
      </Button>
    </Box>

      {showPopup && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex:2000,
          }}
        >
          <Paper
            sx={{
              width: 350,
              p: 4,
              background: "linear-gradient(180deg, #001233 0%, #03045E 100%)",
              textAlign: "center",
              color: "#fff",
              borderRadius: 4,
              boxShadow: "0 0 30px rgba(76, 201, 240, 0.5)",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "#4CC9F0", mb: 2 }}>
              🎯 Results
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Score: {score} / {questions.length}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: "#A0A0A0" }}>
              Great job! Keep improving ⚡
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#7209B7",
                "&:hover": { backgroundColor: "#560BAD" },
                borderRadius: "25px",
                px: 4,
              }}
              onClick={() => window.location.reload()}
            >
              Continue
            </Button>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default TriviaPage;
