import { Box, Button, Typography, Paper, LinearProgress, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { blue } from "@mui/material/colors";

// Helper: decode HTML entities from Open Trivia DB (like &quot;, &#039;)
const decodeHtml = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

// Helper: shuffle the options randomly
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

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log("🎯 Fetching trivia from backend...");
        const res = await axios.get("http://localhost:3001/api/trivia");
        console.log("✅ Response:", res.data);
        if (res.data.success && res.data.data.length > 0) {
          setQuestions(res.data.data);
        } else {
          console.warn("⚠️ No questions received:", res.data);
        }
      } catch (err) {
        console.error("❌ Error fetching trivia:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

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

  if (questions.length === 0) {
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

  const currentQuestion = questions[currentIndex];
  const options = shuffleArray([
    currentQuestion.correct_answer,
    ...currentQuestion.incorrect_answers,
  ]);

  return (
    <Box
      sx={{
        top: 0,
        right: 0,
        position: "fixed",
        width: "100%",
        height: "100vh",
        margin: 0,
        background: "radial-gradient(circle at center, #03045E 0%, #000 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", color: "#4CC9F0", mb: 3 }}
      >
        Trivia Arena ⚡
      </Typography>
  
      {/* Progress Bar */}
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
  
      {/* Question Card */}
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
      onClick={() => setSelectedOption(option)}
        variant="outlined"
        sx={{
          mb: 2,
          width: "100%",
          border: "2px solid #4CC9F0",   
          color: "#4CC9F0",              
          backgroundColor: blue, 
          fontWeight: "bold",
          textTransform: "none",
          "&:hover": {
            backgroundColor: "rgba(76, 201, 240, 0.15)", 
          },
          "&:focus": { outline: "none" },
          "&:active": {
            backgroundColor: "rgba(76, 201, 240, 0.15)", 
            transform: "none", 
          },
          transition: "none",
        }}
      >
        {decodeHtml(option)}
      </Button>
    ))}

      
      </Paper>
  
      {/* Next Question Button */}
      <Button
        variant="contained"
        onClick={() => {
          setSelectedOption(null);
          setCurrentIndex((prev) => (prev + 1) % questions.length);
        }}
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
        Next Question →
      </Button>
    </Box>
  );
  
};

export default TriviaPage;
