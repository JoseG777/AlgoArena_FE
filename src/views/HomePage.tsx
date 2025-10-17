import { Box, Button, Typography, Paper, Grid } from "@mui/material";
import { Link } from "react-router-dom";
import BoltIcon from "@mui/icons-material/Bolt";
import CodeIcon from "@mui/icons-material/Code";
import logo from "../assets/logo.png";
import AlgorithmVortex from "../components/AlgorithmVortex";

const HomePage: React.FC = () =>
{
    return(
       <Box
       sx={{
        width: "100vw",
        minHeight: "100vh",
        top:0,
        left:0,
        position:"absolute",
        background: "linear-gradient(160deg, #03045E, #000000)",
        color: "#fff",
        display:"flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent:"flex-start",
        overflowY: "auto",
        paddingBottom: 6,
        padding: 2,
       }}
       >
        <AlgorithmVortex/>
        {/*LOGO */}
        <Box sx={{ textAlign: "center", mb:3 }}>
            <Box 
            component="img"
            src={logo}
            alt="Algo Arena Logo"
            sx={{
                width: { xs: "160px", sm: "220px", md: "260px" },
                filter: "drop-shadow(0px 0px 15px rgba(76, 201, 240, 0.8))",
            }}
            />
        </Box>

        {/*Heading*/}
        <Typography 
        variant="h4"
        sx={{ fontWeight: "bold", color: "#4CC9F0", textAlign: "center", mb: 1 }}
        >
            COMPETE. CODE. CONQUER.
        </Typography>

        {/*LOGIN & SIGN UP BUTTONS */}
        <Box sx={{ display: "flex", gap:2, mt:2}}>
            <Button
            component={Link}
            to="/sign-in"
          variant="contained"
          sx={{
            backgroundColor: "#3A0CA3",
            "&:hover": { backgroundColor: "#4361EE" },
            fontWeight: "bold",
            color: "#fff",
            px: 4,
            borderRadius: "30px",
          }}
        >
            LOGIN
        </Button>
        <Button 
        component={Link}
        to="/sign-up"
        variant="contained"
        sx={{
          backgroundColor: "#7209B7",
          "&:hover": { backgroundColor: "#560BAD" },
          fontWeight: "bold",
          color: "#fff",
          px: 4,
          borderRadius: "30px",
        }}
        >
            SIGN UP
        </Button>
        </Box>
        {/* FEATURE CARDS */}

        <Grid container spacing={3} justifyContent="center" sx={{ mt: 4, maxWidth: 800}}>
            <Grid item xs={12} sm={6}>
                <Paper
                sx={{
                    backgroundColor: "rgba(0,0,0,0.6)",
                    border: "1px solid rgba(76, 201, 240, 0.4)",
                    borderRadius: 3,
                    p: 3,
                    textAlign: "center",
                    boxShadow: "0 0 15px rgba(76, 201, 240, 0.3)",
                  }}
                >
                    <CodeIcon sx={{ fontSize: 40, color: "#4CC9F0", mb:1}} />
                    <Typography variant="h6" fontWeight="bold">
                        CODING BATTLES
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Solve timed coding challenges, ranked by speed, correctness, and efficiency.
                    </Typography>
                </Paper> 
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper
                sx={{
                    backgroundColor: "rgba(0,0,0,0.6)",
                    border: "1px solid rgba(76, 201, 240, 0.4)",
                    borderRadius: 3,
                    p: 3,
                    textAlign: "center",
                    boxShadow: "0 0 15px rgba(76, 201, 240, 0.3)",
                  }}
                  >
                    <BoltIcon sx={{fontSize: 40, color: "#4CC9F0", mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                        TRIVIA ARENA
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Test your CS knowledge in real-time trivia battles.
                    </Typography>
                  </Paper>
            </Grid>
        </Grid>
        {/*Activity Feed*/}
        <Box
        sx={{
            mt: 4,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            p: 2,
            borderRadius: 2,
            border: "1px solid rgba(76, 201, 240, 0.3)",
            boxShadow: "0 0 10px rgba(76, 201, 240, 0.2)",
            width: "80%",
            maxWidth: 600,
          }}
          >
            <Typography sx={{color:"#4CC9F0", fontWeight: 600 }}>
          ⚡ Sarah just won a coding match in 3 minutes!
        </Typography>
        <Typography sx={{ color: "#4CC9F0", fontWeight: 600 }}>
          💥 John climbed to Rank #5 in Trivia Arena.
        </Typography> 
          </Box>
       </Box>
    );
};

export default HomePage;