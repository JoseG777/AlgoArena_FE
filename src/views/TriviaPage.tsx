import {Box, Button, Typography, Paper, LinearProgress, CircularProgress,} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";

const decodeHtml = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

// Shuffle array (answers)
const shuffleArray = (array: string[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

const TriviaPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  // ✅ Always fetch on mount (hook runs once)
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log("🎯 Fetching trivia questions from backend...");
        const res = await axios.get("http://localhost:3001/api/trivia?category=Computer%20Science");
        if (res.data.success && Array.isArray(res.data.data)) {
          setQuestions(res.data.data);
        } else {
          console.warn("⚠️ Unexpected response:", res.data);
        }
      } catch (err) {
        console.error("❌ Error fetching trivia:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // ✅ Prevent using hooks conditionally
  const hasQuestions = questions.length > 0;
  const currentQuestion = hasQuestions ? questions[currentIndex] : null;

  // ✅ Stable memo hook (no conditional execution)
  const options = useMemo(() => {
    if (!currentQuestion) return [];
    return shuffleArray([
      currentQuestion.correct_answer,
      ...currentQuestion.incorrect_answers,
    ]);
  }, [currentQuestion]);

  // ✅ Handle option click
  const handleAnswerSelect = (option: string) => {
    setSelectedOption(option);
    if (option === currentQuestion?.correct_answer) {
      setScore((prev) => prev + 1);
    }
  };

  // ✅ Move to next or finish
  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setShowPopup(true);
    }
  };

  // ✅ Display loading screen
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

  // ✅ Handle case with no data
  if (!hasQuestions || !currentQuestion) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "radial-gradient(circle at center, #03045E 0%, #000 100%)",
          color: "red",
          fontSize: "1.5rem",
        }}
      >
        No questions available. Please refresh!
      </Box>
    );
  }

  // ✅ Main UI
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "100%",
        height: "100vh",
        background: "radial-gradient(circle at center, #03045E 0%, #000 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
      }}
    >
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#4CC9F0", mb: 3 }}>
        Trivia Arena ⚡
      </Typography>

      {/* Progress */}
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

      {/* Question */}
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
          {decodeHtml(currentQuestion.question)}
        </Typography>

        {options.map((option) => (
          <Button
            key={option}
<<<<<<< HEAD
            variant="outlined"
            onClick={() => setSelectedOption(option)}
            sx={{
              mb: 2,
              width: "100%",
              color: selectedOption === option ? "#000" : "#4CC9F0",
              backgroundColor: selectedOption === option ? "#4CC9F0" : "transparent",
              borderColor: "#4CC9F0",
              fontWeight: "bold",
=======
            onClick={() => handleAnswerSelect(option)}
            disableElevation
            sx={{
              mb: 2,
              width: "100%",
              height: 56,
              border: "2px solid #4CC9F0",
              backgroundColor:
                selectedOption === option ? "#4CC9F0" : "transparent",
              color: selectedOption === option ? "#000" : "#4CC9F0",
              fontWeight: "bold",
              fontSize: "1rem",
              textTransform: "none",
              transition: "background-color 0.2s, color 0.2s",
>>>>>>> f39c458ca58796202317804e47d1406c153defc7
              "&:hover": {
                backgroundColor: "#4CC9F0",
                color: "#000",
              },
            }}
          >
<<<<<<< HEAD
            {option}
=======
            {decodeHtml(option)}
>>>>>>> f39c458ca58796202317804e47d1406c153defc7
          </Button>
        ))}
      </Paper>

<<<<<<< HEAD
      {/* Next Question Button */}
      <Button
        variant="contained"
=======
      {/* Next Button */}
      <Button
        variant="contained"
        onClick={handleNext}
>>>>>>> f39c458ca58796202317804e47d1406c153defc7
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
<<<<<<< HEAD
        Next question →
      </Button>
    </Box>
  );
};
=======
        {currentIndex + 1 < questions.length ? "Next Question →" : "See Results"}
      </Button>

      {/* Popup */}
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

>>>>>>> f39c458ca58796202317804e47d1406c153defc7
export default TriviaPage;
