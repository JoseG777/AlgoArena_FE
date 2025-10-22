import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react";

type Props = {
  children: JSX.Element;
  to?: string;
};

const PublicOnlyRoute: React.FC<Props> = ({ children, to = "/dash-board" }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading…</p>;

  if (user) return <Navigate to={to} replace />;

  return children;
};

export default PublicOnlyRoute;
