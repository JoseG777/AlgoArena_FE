import React from "react";
import { Box, Typography, Button, Paper, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar"; 
import { useInvitations } from "../../context/InvitationContext";
import AlgorithmVortex from "../../components/AlgorithmVortex"; 

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { invitations, removeInvitation } = useInvitations();

  const defaultLang = "typescript"; 

  const handleJoinBattle = (roomCode: string) => {
    removeInvitation(roomCode);
    navigate(`/battle/${encodeURIComponent(roomCode)}?lang=${encodeURIComponent(defaultLang)}`);
  };

  const handleDismiss = (roomCode: string) => {
    removeInvitation(roomCode);
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100dvh",
        position: "relative",
        background: "radial-gradient(circle at top, #001233, #000000)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        overflowX: "hidden",
        p: 2,
        pb: 6,
      }}
    >
      <Box sx={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <AlgorithmVortex />
      </Box>

      <NavBar />
      
      <Box
        sx={{
          paddingTop: "165px", 
          minheight: "100vh",
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 900,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography 
            variant="h3" 
            gutterBottom 
            sx={{
                fontSize: { xs: '2rem', sm: '3rem' },
                fontWeight: '900',
                color: '#60a5fa',
                mb: 4,
                textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
            }}
        >
          Pending Battle Invitations
        </Typography>
        <Divider sx={{ mb: 4, width: '100%', bgcolor: 'rgba(255,255,255,0.2)' }} />

        {invitations.length === 0 ? (
          <Typography variant="h5" color="#94a3b8" sx={{ mt: 4 }}>
            You have no pending battle invitations.
          </Typography>
        ) : (
          <Box sx={{ display: 'grid', gap: 3, width: '100%' }}>
            {invitations.map((invite, index) => (
              <Paper 
                key={invite.roomCode} 
                elevation={6}
                sx={{ 
                  p: 3, 
                  backgroundColor: index % 2 === 0 ? '#1e293b' : '#141e2f', 
                  borderRadius: 2, 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderLeft: '4px solid #38bdf8',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                      backgroundColor: '#283549',
                  }
                }}
              >
                <Box sx={{ mb: { xs: 2, sm: 0 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f1f5f9' }}>
                    Challenge from: {invite.inviterUsername}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={() => handleDismiss(invite.roomCode)}
                        sx={{ 
                            color: '#ccc', 
                            borderColor: '#ccc',
                            '&:hover': {
                                backgroundColor: 'rgba(204, 204, 204, 0.1)',
                                borderColor: '#fff'
                            }
                        }}
                    >
                        Dismiss
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleJoinBattle(invite.roomCode)}
                        sx={{
                            backgroundColor: "#38bdf8",
                            "&:hover": { backgroundColor: "#0ea5e9" },
                        }}
                    >
                        Accept & Join
                    </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default NotificationsPage;