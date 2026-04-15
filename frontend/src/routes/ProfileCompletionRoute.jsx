import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProfileCompletionRoute({ children }) {
  const { loading, user, isAuthenticated, profileComplete } = useAuth();

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

  // Wait until user object is actually loaded before checking
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!profileComplete) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

export default ProfileCompletionRoute;