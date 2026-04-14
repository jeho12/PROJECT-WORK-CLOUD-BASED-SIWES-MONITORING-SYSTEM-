import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const data = await login(formData);
    navigate(data.profile_complete ? "/dashboard" : "/profile");
  } catch (err) {
    setError(
      err?.response?.data?.message ||
        "Login failed. Please check your credentials."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        backgroundColor: isDark ? "#08060d" : "#f4f3ec",
        color: isDark ? "#fff" : "#08060d",
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl border p-8 shadow-2xl"
        style={{
          backgroundColor: isDark ? "#120d1d" : "#fff",
          borderColor: isDark ? "#2a203a" : "#ddd",
        }}
      >
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="mb-6 opacity-80">Login to continue.</p>

        {error && (
          <div className="mb-4 rounded-xl px-4 py-3 bg-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-xl px-4 py-3 outline-none"
            style={{
              backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
              color: isDark ? "#fff" : "#08060d",
            }}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-xl px-4 py-3 outline-none"
            style={{
              backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
              color: isDark ? "#fff" : "#08060d",
            }}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-semibold transition"
            style={{
              backgroundColor: "#aa3bff",
              color: "#fff",
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm opacity-80">
          Don’t have an account?{" "}
          <Link to="/register" style={{ color: "#aa3bff" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;