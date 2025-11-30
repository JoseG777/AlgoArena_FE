import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AlgorithmVortex from "../components/AlgorithmVortex";
import { socket } from "../lib/socket";

interface Question {
  question: string;
  options?: string[];
  correctAnswer?: string;
  correct_answer?: string;
  incorrect_answers?: string[];
  category?: string;
  difficulty?: string;
}

type TriviaResultsPayload = {
  roomCode: string;
  yourScore: number;
  yourCorrectCount: number;
  yourTotalQuestions: number;
  leaderboard: {
    userId: string;
    username: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
  }[];
};

const TriviaPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const [serverScore, setServerScore] = useState<number | null>(null);
  const [roomJoined, setRoomJoined] = useState(false);
  const [roomStarted, setRoomStarted] = useState(false);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [waitingForResults, setWaitingForResults] = useState(false);

  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const roomCode = code || "";

  useEffect(() => {
    if (!socket.connected) socket.connect();
  }, []);

  useEffect(() => {
    if (!roomCode) {
      navigate("/dash-board");
      return;
    }

    socket.emit(
      "joinRoom",
      roomCode,
      (resp: {
        success?: boolean;
        error?: string;
        members?: string[];
        timeLeft?: number | null;
        started?: boolean;
      }) => {
        if (!resp?.success) {
          alert(resp?.error || "Failed to join trivia room");
          navigate("/dash-board");
          return;
        }
        setRoomJoined(true);
        if (resp.started) {
          setRoomStarted(true);
        }
      }
    );

    const onBattleStarted = () => {
      setRoomStarted(true);
    };

    const onRoomClosed = () => {
      if (!showPopup) {
        navigate("/dash-board");
      }
    };

    const onTriviaResults = (payload: TriviaResultsPayload) => {
      if (payload.roomCode !== roomCode) return;
      setServerScore(payload.yourScore);
      setScore(payload.yourCorrectCount);
      setWaitingForResults(false);
      setShowPopup(true);
    };

    socket.on("battleStarted", onBattleStarted);
    socket.on("roomClosed", onRoomClosed);
    socket.on("triviaResults", onTriviaResults as any);

    return () => {
      socket.emit("leaveRoom", roomCode);
      socket.off("battleStarted", onBattleStarted);
      socket.off("roomClosed", onRoomClosed);
      socket.off("triviaResults", onTriviaResults as any);
    };
  }, [roomCode, navigate, showPopup]);

  useEffect(() => {
    if (!roomStarted || questionsLoaded) return;

    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/trivia`, {
          params: { roomCode },
          withCredentials: true,
        });
        if (res.data.success && res.data.data.length > 0) {
          setQuestions(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching trivia:", err);
      } finally {
        setLoading(false);
        setQuestionsLoaded(true);
      }
    };
    fetchQuestions();
  }, [roomStarted, questionsLoaded, roomCode]);

  const currentQuestion = questions[currentIndex];

  const correctForCurrent = useMemo(() => {
    if (!currentQuestion) return undefined;
    return currentQuestion.correctAnswer ?? currentQuestion.correct_answer;
  }, [currentQuestion]);

  const options = useMemo(() => {
    if (!currentQuestion) return [];

    if (currentQuestion.options && currentQuestion.options.length > 0) {
      return currentQuestion.options;
    }

    const baseCorrect =
      currentQuestion.correctAnswer ?? currentQuestion.correct_answer;
    const incorrect = currentQuestion.incorrect_answers || [];
    const arr = [baseCorrect, ...incorrect].filter(
      (v): v is string => typeof v === "string" && v.length > 0
    );

    return arr;
  }, [currentQuestion]);

  const handleAnswerSelect = (option: string) => {
    if (!currentQuestion || !correctForCurrent) return;

    const wasCorrectBefore =
      selectedOption !== null && selectedOption === correctForCurrent;
    const willBeCorrect = option === correctForCurrent;

    setSelectedOption(option);
    setScore((prev) => {
      let next = prev;
      if (wasCorrectBefore && !willBeCorrect) {
        next -= 1;
      } else if (!wasCorrectBefore && willBeCorrect) {
        next += 1;
      }
      if (next < 0) next = 0;
      return next;
    });
  };

  const handleNext = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      try {
        if (roomCode) {
          setWaitingForResults(true);
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/trivia/submit`,
            {
              roomCode,
              correctCount: score,
              totalQuestions: questions.length,
            },
            { withCredentials: true }
          );
          if (!res.data || typeof res.data !== "object") {
            setWaitingForResults(false);
            setServerScore(score * 10);
            setShowPopup(true);
          } else {
            if (res.data.allFinished === true) {
            }
          }
        } else {
          setServerScore(score * 10);
          setShowPopup(true);
        }
      } catch (err) {
        console.error("Error submitting trivia results:", err);
        setWaitingForResults(false);
        setServerScore(score * 10);
        setShowPopup(true);
      }
    }
  };

  if (!roomJoined || !roomStarted) {
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
          background: "radial-gradient(circle at center, #03045E 0%, #000 100%)",
          color: "white",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <AlgorithmVortex />
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2, fontWeight: "bold" }}>
            Waiting for your opponent to join…
          </Typography>
        </Box>
      </Box>
    );
  }

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

  const finalPoints = serverScore ?? score * 10;
  const baseNoBonus = score * 10;
  const extraPoints = finalPoints - baseNoBonus;

  let hasAllCorrectBonus = false;
  let hasSpeedBonus = false;

  if (score === questions.length) {
    if (extraPoints >= 10) {
      hasAllCorrectBonus = true;
    }
    if (extraPoints >= 20) {
      hasSpeedBonus = true;
    }
  } else {
    if (extraPoints >= 10) {
      hasSpeedBonus = true;
    }
  }

  let bonusText = "";
  if (hasAllCorrectBonus && hasSpeedBonus) {
    bonusText = "+10 for all correct, +10 speed bonus (fastest high score).";
  } else if (hasAllCorrectBonus) {
    bonusText = "+10 bonus for getting every question correct.";
  } else if (hasSpeedBonus) {
    bonusText = "+10 speed bonus for finishing first and highest.";
  }

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
      <AlgorithmVortex />

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
          {waitingForResults ? (
            <Box sx={{ mt: 2 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2, fontWeight: "bold", color: "#A0A0A0" }}>
                Waiting for your opponent to finish…
              </Typography>
            </Box>
          ) : (
            <>
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
            </>
          )}
        </Paper>

        {!waitingForResults && (
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
            {currentIndex + 1 < questions.length ? "Next Question →" : "Submit Answers"}
          </Button>
        )}
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
            zIndex: 2000,
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
              Correct: {score} / {questions.length}
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Battle Points: {finalPoints}
            </Typography>
            {bonusText && (
              <Typography variant="body2" sx={{ mb: 2, color: "#fbbf24" }}>
                {bonusText}
              </Typography>
            )}
            <Typography variant="body1" sx={{ mb: 3, color: "#A0A0A0" }}>
              Speed and accuracy both matter. Nice work ⚡
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#7209B7",
                "&:hover": { backgroundColor: "#560BAD" },
                borderRadius: "25px",
                px: 4,
              }}
              onClick={() => {
                if (roomCode) {
                  socket.emit("triviaDone", roomCode);
                }
                navigate("/dash-board");
              }}
            >
              Done
            </Button>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default TriviaPage;
