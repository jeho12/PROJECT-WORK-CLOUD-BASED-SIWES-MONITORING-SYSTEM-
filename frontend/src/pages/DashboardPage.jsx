import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AppLayout from "../layouts/AppLayout";

function DashboardPage() {
  const { token, user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboardData(response.data);
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    }
  }, [token]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: isDark ? "#08060d" : "#f4f3ec",
          color: isDark ? "#fff" : "#08060d",
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  const attendance = dashboardData?.attendance;
  const todayLog = dashboardData?.today_log;
  const week = dashboardData?.week;
  const profile = dashboardData?.profile;

  const progressPercent = week
    ? Math.round((week.days_completed / week.total_days) * 100)
    : 0;

  const weekDays = [
    { short: "Mon", full: "monday" },
    { short: "Tue", full: "tuesday" },
    { short: "Wed", full: "wednesday" },
    { short: "Thu", full: "thursday" },
    { short: "Fri", full: "friday" },
  ];

  return (
    <AppLayout title="Dashboard" subtitle={`Welcome, ${user?.name || "Student"}`}>
      <div className="space-y-6">
        {!profile?.complete && (
          <div className="rounded-2xl px-5 py-4 bg-yellow-500/20 text-yellow-300">
            Your profile is not complete yet. Complete it to avoid restrictions.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
          >
            <h3 className="font-semibold text-lg mb-3">Attendance Today</h3>
            <p className="text-sm opacity-80 mb-2">
              Check-in: {attendance?.checked_in ? `Yes (${attendance?.check_in_time})` : "Not yet"}
            </p>
            <p className="text-sm opacity-80 mb-2">
              Check-out: {attendance?.checked_out ? `Yes (${attendance?.check_out_time})` : "Not yet"}
            </p>
            <p className="text-sm opacity-80">
              Status:{" "}
              {attendance?.checked_in && attendance?.checked_out
                ? "Completed"
                : attendance?.checked_in
                ? "Checked in"
                : "Pending"}
            </p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
          >
            <h3 className="font-semibold text-lg mb-3">Today’s Logbook</h3>
            <p className="text-sm opacity-80 mb-2">
              Entry: {todayLog?.exists ? "Created" : "Not created"}
            </p>
            <p className="text-sm opacity-80 mb-2">
              Completed: {todayLog?.completed ? "Yes" : "No"}
            </p>
            <p className="text-sm opacity-80">
              Time Range:{" "}
              {todayLog?.time_in || todayLog?.time_out
                ? `${todayLog?.time_in || "--"} - ${todayLog?.time_out || "--"}`
                : "Not set"}
            </p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
          >
            <h3 className="font-semibold text-lg mb-3">Profile Status</h3>
            <p className="text-sm opacity-80 mb-2">
              Profile: {profile?.complete ? "Complete" : "Incomplete"}
            </p>
            <p className="text-sm opacity-80 mb-4">
              Keep your SIWES and school details updated.
            </p>
            <Link to="/profile" style={{ color: "#aa3bff" }}>
              Go to Profile
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4">
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
          >
            <h3 className="font-semibold text-xl mb-4">Quick Actions</h3>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/logbook"
                className="rounded-xl px-5 py-3 font-semibold"
                style={{
                  backgroundColor: "#aa3bff",
                  color: "#fff",
                }}
              >
                Open Logbook
              </Link>

              <Link
                to="/profile"
                className="rounded-xl px-5 py-3 font-semibold"
                style={{
                  backgroundColor: isDark ? "#120d1d" : "#e5e4e7",
                  color: isDark ? "#fff" : "#08060d",
                }}
              >
                Update Profile
              </Link>
            </div>

            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: isDark ? "#120d1d" : "#fff" }}
              >
                <p className="text-sm opacity-70 mb-1">Need to do</p>
                <p className="font-semibold">
                  {!attendance?.checked_in
                    ? "Check in"
                    : !todayLog?.completed
                    ? "Complete today’s log"
                    : week?.days_completed < 5
                    ? "Continue daily entries"
                    : !week?.report_saved
                    ? "Save weekly report"
                    : "You are on track"}
                </p>
              </div>

              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: isDark ? "#120d1d" : "#fff" }}
              >
                <p className="text-sm opacity-70 mb-1">Week status</p>
                <p className="font-semibold capitalize">{week?.status || "Not started"}</p>
              </div>

              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: isDark ? "#120d1d" : "#fff" }}
              >
                <p className="text-sm opacity-70 mb-1">Report</p>
                <p className="font-semibold">
                  {week?.report_saved ? "Saved" : "Not saved yet"}
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
          >
            <h3 className="font-semibold text-xl mb-4">Weekly Progress</h3>

            <div
              className="w-full h-4 rounded-full overflow-hidden mb-3"
              style={{ backgroundColor: isDark ? "#120d1d" : "#e5e4e7" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: "#aa3bff",
                }}
              />
            </div>

            <p className="text-sm opacity-80 mb-4">
              {week?.days_completed || 0} of {week?.total_days || 5} days completed
            </p>

            <div className="grid grid-cols-3 gap-3">
              {weekDays.map((day) => {
                const filled = week?.completed_days?.includes(day.full);

                return (
                  <div
                    key={day.full}
                    className="rounded-xl px-3 py-4 text-center font-semibold"
                    style={{
                      backgroundColor: filled
                        ? "#aa3bff"
                        : isDark
                        ? "#120d1d"
                        : "#fff",
                      color: filled ? "#fff" : isDark ? "#fff" : "#08060d",
                    }}
                  >
                    {day.short}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default DashboardPage;