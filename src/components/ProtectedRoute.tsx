import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react";

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading session...</p>; 
  if (!user) return <Navigate to="/sign-in" replace />; 
  return children;
};

export default ProtectedRoute;
