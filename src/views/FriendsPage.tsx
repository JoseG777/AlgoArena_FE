import { useState } from "react";
import { Box } from "@mui/material";
import NavBar from "../components/NavBar";
import SeeFriends from "../components/SeeFriends";
import SeeFriendRequests from "../components/SeeFriendRequests";
import SendFriendRequest from "../components/SendFriendRequest";
import AlgorithmVortex from "../components/AlgorithmVortex";
import "./FriendsPage.css";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "send">("friends");

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

      <Box
        sx={{
          paddingTop: "165px",
          minheight: "100vh",
          position: "relative",
          zIndex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <NavBar />
        <h1 className="page-title">Friend System</h1>

        <div className="tab-container">
          <button
            className={`tab-btn ${activeTab === "friends" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            🧑‍🤝‍🧑 Friends
          </button>
          <button
            className={`tab-btn ${activeTab === "requests" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            📩 Requests
          </button>
          <button
            className={`tab-btn ${activeTab === "send" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("send")}
          >
            ➕ Send Request
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "friends" && <SeeFriends />}
          {activeTab === "requests" && <SeeFriendRequests />}
          {activeTab === "send" && <SendFriendRequest />}
        </div>
      </Box>
    </Box>
  );
}
