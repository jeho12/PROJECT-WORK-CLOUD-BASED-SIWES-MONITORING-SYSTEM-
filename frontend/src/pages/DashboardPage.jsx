import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isDark = theme === "dark";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundColor: isDark ? "#08060d" : "#f4f3ec",
        color: isDark ? "#fff" : "#08060d",
      }}
    >
      <aside
        className="w-72 min-h-screen border-r p-6 hidden md:block"
        style={{
          backgroundColor: isDark ? "#0f0a17" : "#ffffff",
          borderColor: isDark ? "#2a203a" : "#ddd",
        }}
      >
        <p
          className="uppercase tracking-[0.2em] text-sm font-semibold mb-8"
          style={{ color: "#aa3bff" }}
        >
          SIWES System
        </p>

        <nav className="space-y-3">
          <Link
            to="/dashboard"
            className="block rounded-xl px-4 py-3 font-semibold"
            style={{
              backgroundColor: "#aa3bff",
              color: "#fff",
            }}
          >
            Dashboard
          </Link>

          <Link
            to="/profile"
            className="block rounded-xl px-4 py-3 font-semibold"
            style={{
              backgroundColor: isDark ? "#1a1426" : "#e5e4e7",
              color: isDark ? "#fff" : "#08060d",
            }}
          >
            Profile
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <div
            className="rounded-3xl border p-8 shadow-2xl"
            style={{
              backgroundColor: isDark ? "#120d1d" : "#fff",
              borderColor: isDark ? "#2a203a" : "#ddd",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p
                  className="uppercase tracking-[0.2em] text-sm font-semibold mb-2"
                  style={{ color: "#aa3bff" }}
                >
                  Dashboard
                </p>
                <h1 className="text-4xl font-bold">
                  Welcome, {user?.name || "User"}
                </h1>
                <p className="mt-2 opacity-80">
                  Role: {user?.roles?.[0]?.name || "student"}
                </p>
                <p className="opacity-80">Email: {user?.email || ""}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={toggleTheme}
                  className="rounded-xl px-4 py-3 font-semibold"
                  style={{
                    backgroundColor: "#aa3bff",
                    color: "#fff",
                  }}
                >
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>

                <button
                  onClick={handleLogout}
                  className="rounded-xl px-4 py-3 font-semibold"
                  style={{
                    backgroundColor: isDark ? "#1a1426" : "#e5e4e7",
                    color: isDark ? "#fff" : "#08060d",
                  }}
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-10">
              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
              >
                <h3 className="font-semibold mb-2">Daily Logs</h3>
                <p className="text-sm opacity-80">
                  Create and manage your SIWES daily log entries.
                </p>
              </div>

              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
              >
                <h3 className="font-semibold mb-2">Weekly Summary</h3>
                <p className="text-sm opacity-80">
                  Submit weekly summaries and track approvals.
                </p>
              </div>

              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
              >
                <h3 className="font-semibold mb-2">Attendance</h3>
                <p className="text-sm opacity-80">
                  Monitor check-ins, check-outs, and activity history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;