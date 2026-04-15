import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function LogbookPage() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [todayData, setTodayData] = useState(null);
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({
    time_in: "",
    time_out: "",
    activity: "",
  });

  const [weeklyData, setWeeklyData] = useState({
    projects: "",
    section_department: "",
    student_comment: "",
    work_done: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingDaily, setSavingDaily] = useState(false);
  const [savingWeekly, setSavingWeekly] = useState(false);
  const [submittingWeek, setSubmittingWeek] = useState(false);

  const fetchToday = async () => {
    try {
      const response = await api.get("/logbook/today", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTodayData(response.data);

      if (response.data.today_entry) {
        setFormData({
          time_in: response.data.today_entry.time_in || "",
          time_out: response.data.today_entry.time_out || "",
          activity: response.data.today_entry.activity || "",
        });
      }

      if (response.data.week?.id) {
        const weekResponse = await api.get(`/logbook/week/${response.data.week.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (weekResponse.data.report) {
          setWeeklyData({
            projects: weekResponse.data.report.projects || "",
            section_department: weekResponse.data.report.section_department || "",
            student_comment: weekResponse.data.report.student_comment || "",
            work_done: weekResponse.data.report.work_done || "",
          });
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load today’s logbook.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get("/logbook/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHistory(response.data.weeks || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchToday();
    fetchHistory();
  }, [token]);

  const handleDailyChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleWeeklyChange = (e) => {
    setWeeklyData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveDailyLog = async (e) => {
    e.preventDefault();
    setSavingDaily(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/logbook/today", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(response.data.message);
      await fetchToday();
      await fetchHistory();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save daily log.");
    } finally {
      setSavingDaily(false);
    }
  };

  const saveWeeklyReport = async (e) => {
    e.preventDefault();

    if (!todayData?.week?.id) return;

    setSavingWeekly(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post(
        `/logbook/week/${todayData.week.id}/report`,
        weeklyData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);
      await fetchToday();
      await fetchHistory();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save weekly report.");
    } finally {
      setSavingWeekly(false);
    }
  };

  const submitWeek = async () => {
    if (!todayData?.week?.id) return;

    setSubmittingWeek(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post(
        `/logbook/week/${todayData.week.id}/submit`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);
      await fetchToday();
      await fetchHistory();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit week.");
    } finally {
      setSubmittingWeek(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: isDark ? "#08060d" : "#f4f3ec",
          color: isDark ? "#fff" : "#08060d",
        }}
      >
        Loading logbook...
      </div>
    );
  }

  const week = todayData?.week;
  const canUseWeekly = week?.days_completed >= 6 && week?.status !== "submitted" && week?.status !== "approved";
  const isWeekLocked = week?.status === "submitted" || week?.status === "approved";

  return (
    <div
      className="min-h-screen px-6 py-10"
      style={{
        backgroundColor: isDark ? "#08060d" : "#f4f3ec",
        color: isDark ? "#fff" : "#08060d",
      }}
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div
            className="rounded-3xl border p-8 shadow-2xl"
            style={{
              backgroundColor: isDark ? "#120d1d" : "#fff",
              borderColor: isDark ? "#2a203a" : "#ddd",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <p
                  className="uppercase tracking-[0.2em] text-sm font-semibold mb-2"
                  style={{ color: "#aa3bff" }}
                >
                  Daily Logbook
                </p>
                <h1 className="text-4xl font-bold">Today’s Entry</h1>
                <p className="opacity-80 mt-2">
                  {todayData?.day_name
                    ? `${todayData.day_name.charAt(0).toUpperCase()}${todayData.day_name.slice(1)} · ${todayData.today}`
                    : "Today"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/dashboard"
                  className="rounded-xl px-4 py-3 font-semibold"
                  style={{
                    backgroundColor: isDark ? "#1a1426" : "#e5e4e7",
                    color: isDark ? "#fff" : "#08060d",
                  }}
                >
                  Dashboard
                </Link>
              </div>
            </div>

            {message && (
              <div className="mb-4 rounded-xl px-4 py-3 bg-green-500/20 text-green-300 text-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-xl px-4 py-3 bg-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            {todayData?.can_submit === false ? (
              <div className="rounded-xl px-4 py-4 bg-yellow-500/20 text-yellow-300">
                {todayData?.message}
              </div>
            ) : (
              <form onSubmit={saveDailyLog} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="time"
                    name="time_in"
                    value={formData.time_in}
                    onChange={handleDailyChange}
                    className="rounded-xl px-4 py-3 outline-none"
                    style={{
                      backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
                      color: isDark ? "#fff" : "#08060d",
                    }}
                  />

                  <input
                    type="time"
                    name="time_out"
                    value={formData.time_out}
                    onChange={handleDailyChange}
                    className="rounded-xl px-4 py-3 outline-none"
                    style={{
                      backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
                      color: isDark ? "#fff" : "#08060d",
                    }}
                  />
                </div>

                <textarea
                  name="activity"
                  value={formData.activity}
                  onChange={handleDailyChange}
                  placeholder="Nature of activities for today"
                  rows="7"
                  className="w-full rounded-xl px-4 py-3 outline-none"
                  style={{
                    backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
                    color: isDark ? "#fff" : "#08060d",
                  }}
                  required
                />

                <button
                  type="submit"
                  disabled={savingDaily || isWeekLocked}
                  className="rounded-xl px-6 py-3 font-semibold"
                  style={{
                    backgroundColor: "#aa3bff",
                    color: "#fff",
                    opacity: isWeekLocked ? 0.6 : 1,
                  }}
                >
                  {savingDaily ? "Saving..." : "Save Today’s Log"}
                </button>
              </form>
            )}
          </div>

          <div
            className="rounded-3xl border p-8 shadow-2xl"
            style={{
              backgroundColor: isDark ? "#120d1d" : "#fff",
              borderColor: isDark ? "#2a203a" : "#ddd",
            }}
          >
            <div className="mb-6">
              <p
                className="uppercase tracking-[0.2em] text-sm font-semibold mb-2"
                style={{ color: "#aa3bff" }}
              >
                Weekly Report
              </p>
              <h2 className="text-3xl font-bold">Week Summary</h2>
              <p className="opacity-80 mt-2">
                This unlocks after all Monday to Saturday entries are completed.
              </p>
            </div>

            {!canUseWeekly && (
              <div className="mb-4 rounded-xl px-4 py-4 bg-yellow-500/20 text-yellow-300 text-sm">
                Complete all six daily entries before saving your weekly report.
              </div>
            )}

            <form onSubmit={saveWeeklyReport} className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="projects"
                value={weeklyData.projects}
                onChange={handleWeeklyChange}
                placeholder="Projects / Job for the week"
                className="rounded-xl px-4 py-3 outline-none"
                style={{
                  backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
                  color: isDark ? "#fff" : "#08060d",
                }}
                disabled={!canUseWeekly}
              />

              <input
                type="text"
                name="section_department"
                value={weeklyData.section_department}
                onChange={handleWeeklyChange}
                placeholder="Section / Department"
                className="rounded-xl px-4 py-3 outline-none"
                style={{
                  backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
                  color: isDark ? "#fff" : "#08060d",
                }}
                disabled={!canUseWeekly}
              />

              <textarea
                name="student_comment"
                value={weeklyData.student_comment}
                onChange={handleWeeklyChange}
                placeholder="Comments by Student"
                rows="4"
                className="rounded-xl px-4 py-3 outline-none md:col-span-2"
                style={{
                  backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
                  color: isDark ? "#fff" : "#08060d",
                }}
                disabled={!canUseWeekly}
              />

              <textarea
                name="work_done"
                value={weeklyData.work_done}
                onChange={handleWeeklyChange}
                placeholder="Work done during the week"
                rows="8"
                className="rounded-xl px-4 py-3 outline-none md:col-span-2"
                style={{
                  backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
                  color: isDark ? "#fff" : "#08060d",
                }}
                disabled={!canUseWeekly}
                required
              />

              <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingWeekly || !canUseWeekly}
                  className="rounded-xl px-6 py-3 font-semibold"
                  style={{
                    backgroundColor: "#aa3bff",
                    color: "#fff",
                    opacity: !canUseWeekly ? 0.6 : 1,
                  }}
                >
                  {savingWeekly ? "Saving..." : "Save Weekly Report"}
                </button>

                <button
                  type="button"
                  onClick={submitWeek}
                  disabled={submittingWeek || !canUseWeekly}
                  className="rounded-xl px-6 py-3 font-semibold"
                  style={{
                    backgroundColor: isDark ? "#1a1426" : "#e5e4e7",
                    color: isDark ? "#fff" : "#08060d",
                    opacity: !canUseWeekly ? 0.6 : 1,
                  }}
                >
                  {submittingWeek ? "Submitting..." : "Submit Week"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div
            className="rounded-3xl border p-6 shadow-2xl"
            style={{
              backgroundColor: isDark ? "#120d1d" : "#fff",
              borderColor: isDark ? "#2a203a" : "#ddd",
            }}
          >
            <p
              className="uppercase tracking-[0.2em] text-sm font-semibold mb-4"
              style={{ color: "#aa3bff" }}
            >
              Week Progress
            </p>

            <div className="space-y-3 text-sm">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
                const found = week?.days?.find(
                  (item) => item.day_name?.toLowerCase() === day.toLowerCase()
                );

                return (
                  <div
                    key={day}
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{
                      backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
                    }}
                  >
                    <span>{day}</span>
                    <span>{found ? "✅" : "⏳"}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-sm opacity-80">
              <p>Status: <strong>{week?.status || "N/A"}</strong></p>
              <p>Completed Days: <strong>{week?.days_completed || 0}/6</strong></p>
            </div>
          </div>

          <div
            className="rounded-3xl border p-6 shadow-2xl"
            style={{
              backgroundColor: isDark ? "#120d1d" : "#fff",
              borderColor: isDark ? "#2a203a" : "#ddd",
            }}
          >
            <p
              className="uppercase tracking-[0.2em] text-sm font-semibold mb-4"
              style={{ color: "#aa3bff" }}
            >
              History
            </p>

            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-sm opacity-70">No previous weeks yet.</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl px-4 py-3"
                    style={{
                      backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
                    }}
                  >
                    <p className="font-semibold">
                      {item.week_start_date} → {item.week_end_date}
                    </p>
                    <p className="text-sm opacity-80">
                      Status: {item.status}
                    </p>
                    <p className="text-sm opacity-80">
                      Days: {item.days?.length || 0}/6
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogbookPage;