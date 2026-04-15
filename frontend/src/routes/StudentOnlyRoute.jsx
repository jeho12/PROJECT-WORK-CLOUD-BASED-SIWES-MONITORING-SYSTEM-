import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function StudentOnlyRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roles = user?.roles?.map((role) => role.name || role) || [];

  if (roles.includes("admin")) {
    return <Navigate to="/admin" replace />;
  }

  if (roles.includes("supervisor")) {
    return <Navigate to="/supervisor/dashboard" replace />;
  }

  return children;
}

export default StudentOnlyRoute;