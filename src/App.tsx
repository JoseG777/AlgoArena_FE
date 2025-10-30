import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./views/HomePage";
import SignUp from "./views/SignUp";
import SignIn from "./views/SignIn";
import HostedJudge0Runner from "./views/HostedJude0Test";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import AuthRoom from "./views/AuthRoom";
import SendFriendRequest from "./views/SendFriendRequest";
import SeeFriendRequests from "./views/SeeFriendRequests";
import SeeFriends from "./views/SeeFriends";
import Dashboard from "./views/Dashboard";
import TriviaPage from "./views/TriviaPage";
import BattleRoom from "./views/BattleRoom";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute to="/dash-board">
              <HomePage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/sign-up"
          element={
            <PublicOnlyRoute to="/dash-board">
              <SignUp />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/sign-in"
          element={
            <PublicOnlyRoute to="/dash-board">
              <SignIn />
            </PublicOnlyRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dash-board"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/battle/:code"
          element={
            <ProtectedRoute>
              <BattleRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="auth-room"
          element={
            <ProtectedRoute>
              <AuthRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/test-judge"
          element={
            <ProtectedRoute>
              <HostedJudge0Runner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/send-request"
          element={
            <ProtectedRoute>
              <SendFriendRequest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/see-requests"
          element={
            <ProtectedRoute>
              <SeeFriendRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <SeeFriends />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trivia"
          element={
            <ProtectedRoute>
              <TriviaPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
