import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function DashboardPage() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  return (
    <AppLayout title="Dashboard" subtitle={`Welcome, ${user?.name || "User"}`}>
      <div className="grid md:grid-cols-3 gap-4">
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
        >
          <h3 className="font-semibold mb-2">Daily Logs</h3>
          <p className="text-sm opacity-80 mb-4">
            Create and manage your SIWES daily log entries.
          </p>
          <Link to="/logbook" style={{ color: "#aa3bff" }}>
            Open Logbook
          </Link>
        </div>

        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
        >
          <h3 className="font-semibold mb-2">Profile Status</h3>
          <p className="text-sm opacity-80 mb-4">
            {user?.profile_complete
              ? "Your profile is complete."
              : "Complete your profile to use all features."}
          </p>
          <Link to="/profile" style={{ color: "#aa3bff" }}>
            View Profile
          </Link>
        </div>

        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
        >
          <h3 className="font-semibold mb-2">Weekly Progress</h3>
          <p className="text-sm opacity-80 mb-4">
            Track your current week and submission progress.
          </p>
          <Link to="/logbook" style={{ color: "#aa3bff" }}>
            Check Progress
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}

export default DashboardPage;