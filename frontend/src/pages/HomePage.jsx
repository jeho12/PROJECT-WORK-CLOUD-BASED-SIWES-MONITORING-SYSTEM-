import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

function HomePage() {
  const [message, setMessage] = useState("Loading...");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    api.get("/ping")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch(() => {
        setMessage("Could not connect to backend");
      });
  }, []);

  const isDark = theme === "dark";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 transition-all duration-300"
      style={{
        backgroundColor: isDark ? "#08060d" : "#f4f3ec",
        color: isDark ? "#ffffff" : "#08060d",
      }}
    >
      <div
        className="w-full max-w-4xl rounded-3xl border p-10 shadow-2xl"
        style={{
          backgroundColor: isDark ? "#120d1d" : "#ffffff",
          borderColor: isDark ? "#2a203a" : "#ddd",
        }}
      >
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <p
              className="text-sm font-medium uppercase tracking-[0.2em]"
              style={{ color: "#aa3bff" }}
            >
              SIWES System
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mt-2 leading-tight">
              Cloud-Based SIWES Logbook Application
            </h1>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-3 rounded-xl font-semibold transition"
            style={{
              backgroundColor: "#aa3bff",
              color: "#fff",
            }}
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <p
          className="text-lg mb-6"
          style={{ color: isDark ? "#e5e4e7" : "#444" }}
        >
          {message}
        </p>

        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            to="/register"
            className="rounded-xl px-6 py-3 font-semibold"
            style={{ backgroundColor: "#aa3bff", color: "#fff" }}
          >
            Get Started
          </Link>

          <Link
            to="/login"
            className="rounded-xl px-6 py-3 font-semibold border"
            style={{
              borderColor: isDark ? "#2a203a" : "#ddd",
              color: isDark ? "#fff" : "#08060d",
            }}
          >
            Login
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
          >
            <h3 className="font-semibold mb-2">Student Logs</h3>
            <p className="text-sm opacity-80">
              Daily entries, weekly summaries, and file uploads.
            </p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
          >
            <h3 className="font-semibold mb-2">Supervisor Reviews</h3>
            <p className="text-sm opacity-80">
              Approvals, feedback, and digital oversight.
            </p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
          >
            <h3 className="font-semibold mb-2">Coordinator Monitoring</h3>
            <p className="text-sm opacity-80">
              Reports, suspicious activity flags, and tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;