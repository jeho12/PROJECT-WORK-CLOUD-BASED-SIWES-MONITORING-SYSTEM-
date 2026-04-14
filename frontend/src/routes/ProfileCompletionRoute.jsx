import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProfileCompletionRoute({ children }) {
  const { loading, user, isAuthenticated } = useAuth();

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

  if (user && !user.profile_complete) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

export default ProfileCompletionRoute;