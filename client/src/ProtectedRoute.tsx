import { Navigate } from "react-router-dom";
import { authService } from "./services/auth";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const user = authService.getUser(); // or localStorage.getItem("user")

  if (!user) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
}
