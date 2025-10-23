import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './views/HomePage';
import SignUp from './views/SignUp';
import SignIn from './views/SignIn';
import HostedJudge0Runner from './views/HostedJude0Test';
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from './components/PublicOnlyRoute';
import AuthRoom from './views/AuthRoom';
import './App.css'
import Dashboard from './views/Dashboard';


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
          path="auth-room"
          element={
            <ProtectedRoute>
              <AuthRoom/>
            </ProtectedRoute>
          }
        />

        <Route path="/test-judge" element={
          <ProtectedRoute>
            <HostedJudge0Runner/>
          </ProtectedRoute>
          }
        />
      </Routes>

      
    </BrowserRouter>
  )
}

export default App
