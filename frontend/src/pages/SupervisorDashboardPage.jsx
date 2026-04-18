import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AppLayout from "../layouts/AppLayout";

function SupervisorDashboardPage() {
  const { token, user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [data, setData] = useState({
    students: [],
    submitted_weeks: [],
  });

  const [sessions, setSessions] = useState([]);
  const [sessionForm, setSessionForm] = useState({
    student_id: "",
    title: "",
    description: "",
    scheduled_at: "",
    duration_minutes: 30,
  });

  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [joiningSessionId, setJoiningSessionId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchSupervisorDashboard = async () => {
    try {
      setError("");

      const res = await api.get("/supervisor/dashboard", {
        headers: authHeaders,
      });

      setData({
        students: res.data.students || [],
        submitted_weeks: res.data.submitted_weeks || [],
      });
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await api.get("/online-supervision/supervisor", {
        headers: authHeaders,
      });

      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSupervisorDashboard();
      fetchSessions();
    }
  }, [token]);

  const handleScheduleSession = async (e) => {
    e.preventDefault();

    try {
      setScheduling(true);
      setMessage("");
      setError("");

      const payload = {
        ...sessionForm,
        duration_minutes: Number(sessionForm.duration_minutes),
      };

      const res = await api.post("/online-supervision/schedule", payload, {
        headers: authHeaders,
      });

      setMessage(res.data.message || "Session scheduled successfully");

      setSessionForm({
        student_id: "",
        title: "",
        description: "",
        scheduled_at: "",
        duration_minutes: 30,
      });

      fetchSessions();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to schedule session");
    } finally {
      setScheduling(false);
    }
  };

  const handleJoinSession = async (session) => {
    try {
      setJoiningSessionId(session.id);
      setMessage("");
      setError("");

      const res = await api.post(
        `/online-supervision/join/${session.id}`,
        {
          latitude: 0,
          longitude: 0,
        },
        {
          headers: authHeaders,
        }
      );

      const joinUrl = res.data?.join_url || session.join_url;

      if (joinUrl) {
        window.open(joinUrl, "_blank", "noopener,noreferrer");
        setMessage("Opening supervision session...");
      } else {
        setError("Session link is unavailable.");
      }

      fetchSessions();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to join session");
    } finally {
      setJoiningSessionId(null);
    }
  };

  const handleCopyLink = async (joinUrl) => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setMessage("Link copied!");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to copy link.");
    }
  };

  const getCountdown = (scheduledAt) => {
    const diff = new Date(scheduledAt) - new Date();

    if (diff <= 0) return "Started";

    const totalMinutes = Math.floor(diff / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} mins`;
  };

  const pendingReviews = data.submitted_weeks.filter(
    (item) =>
      !item.weekly_report ||
      item.weekly_report.review_status === "pending" ||
      item.status === "submitted"
  );

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: isDark ? "#08060d" : "#f4f3ec",
          color: isDark ? "#fff" : "#08060d",
        }}
      >
        Loading supervisor dashboard...
      </div>
    );
  }

  return (
    <AppLayout title="Supervisor" subtitle={`Welcome, ${user?.name}`}>
      <div className="space-y-6">
        {message && (
          <div className="bg-green-500/20 p-3 rounded-xl text-green-300">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 p-3 rounded-xl text-red-300">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[#1a1426]">
            <p>Assigned Students</p>
            <h2 className="text-2xl font-bold">{data.students.length}</h2>
          </div>

          <div className="p-5 rounded-xl bg-[#1a1426]">
            <p>Submitted Weeks</p>
            <h2 className="text-2xl font-bold">
              {data.submitted_weeks.length}
            </h2>
          </div>

          <div className="p-5 rounded-xl bg-[#1a1426]">
            <p>Pending Reviews</p>
            <h2 className="text-2xl font-bold">{pendingReviews.length}</h2>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#1a1426]">
          <h3 className="text-xl font-semibold mb-4">
            Schedule Online Supervision
          </h3>

          <form
            onSubmit={handleScheduleSession}
            className="grid md:grid-cols-2 gap-4"
          >
            <select
              value={sessionForm.student_id}
              onChange={(e) =>
                setSessionForm((prev) => ({
                  ...prev,
                  student_id: e.target.value,
                }))
              }
              className="p-3 rounded-xl bg-[#120d1d]"
              required
            >
              <option value="">Select Student</option>
              {data.students.map((s) => (
                <option key={s.user?.id} value={s.user?.id}>
                  {s.user?.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Title"
              value={sessionForm.title}
              onChange={(e) =>
                setSessionForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="p-3 rounded-xl bg-[#120d1d]"
              required
            />

            <input
              type="datetime-local"
              value={sessionForm.scheduled_at}
              onChange={(e) =>
                setSessionForm((prev) => ({
                  ...prev,
                  scheduled_at: e.target.value,
                }))
              }
              className="p-3 rounded-xl bg-[#120d1d]"
              required
            />

            <input
              type="number"
              min="10"
              max="180"
              value={sessionForm.duration_minutes}
              onChange={(e) =>
                setSessionForm((prev) => ({
                  ...prev,
                  duration_minutes: e.target.value,
                }))
              }
              className="p-3 rounded-xl bg-[#120d1d]"
              required
            />

            <textarea
              placeholder="Description"
              value={sessionForm.description}
              onChange={(e) =>
                setSessionForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="md:col-span-2 p-3 rounded-xl bg-[#120d1d]"
              rows={4}
            />

            <button
              type="submit"
              disabled={scheduling}
              className="md:col-span-2 bg-purple-600 p-3 rounded-xl font-semibold"
            >
              {scheduling ? "Scheduling..." : "Schedule"}
            </button>
          </form>
        </div>

        <div className="p-6 rounded-2xl bg-[#1a1426]">
          <h3 className="text-xl font-semibold mb-4">Scheduled Sessions</h3>

          {sessions.length === 0 ? (
            <p>No sessions yet</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((s) => (
                <div key={s.id} className="p-4 bg-[#120d1d] rounded-xl">
                  <h4 className="font-semibold">{s.title}</h4>
                  <p className="text-sm">Student: {s.student?.name}</p>
                  <p className="text-sm">
                    {new Date(s.scheduled_at).toLocaleString()}
                  </p>
                  <p className="text-sm opacity-80">
                    Starts in: {getCountdown(s.scheduled_at)}
                  </p>
                  <p className="text-sm">
                    Status: <span className="text-purple-400">{s.status}</span>
                  </p>

                  <div className="mt-3 flex gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleJoinSession(s)}
                      disabled={joiningSessionId === s.id}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold"
                    >
                      {joiningSessionId === s.id
                        ? "Opening..."
                        : "Join Session"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(s.join_url)}
                      className="px-4 py-2 rounded-xl bg-gray-700 text-white font-semibold"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default SupervisorDashboardPage;