import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function AppLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isDark = theme === "dark";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Profile", path: "/profile" },
    { name: "Logbook", path: "/logbook" },
  ];

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
          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="block rounded-xl px-4 py-3 font-semibold transition"
                style={{
                  backgroundColor: active
                    ? "#aa3bff"
                    : isDark
                    ? "#1a1426"
                    : "#e5e4e7",
                  color: active ? "#fff" : isDark ? "#fff" : "#08060d",
                }}
              >
                {item.name}
              </Link>
            );
          })}
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
              <div>
                <p
                  className="uppercase tracking-[0.2em] text-sm font-semibold mb-2"
                  style={{ color: "#aa3bff" }}
                >
                  {title}
                </p>
                <h1 className="text-4xl font-bold">{subtitle}</h1>
                <p className="mt-2 opacity-80">
                  {user?.name} · {user?.email}
                </p>
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

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AppLayout;