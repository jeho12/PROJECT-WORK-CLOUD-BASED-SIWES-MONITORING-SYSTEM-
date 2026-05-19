import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AppLayout from "../layouts/AppLayout";

function StudentOnlineSupervisionPage() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [sessions, setSessions] = useState([]);
  const [joinUrl, setJoinUrl] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [joiningSessionId, setJoiningSessionId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchSessions = useCallback(async () => {
    try {
      setError("");
      const res = await api.get("/online-supervision/student", { headers });
      setSessions(res.data.sessions || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  }, [headers]);

  useEffect(() => {
    if (token) {
      fetchSessions();
    }
  }, [fetchSessions, token]);

  const getCountdown = (time) => {
    const diff = new Date(time) - new Date();
    if (diff <= 0) return "Started";

    const mins = Math.floor(diff / 60000);
    return `${mins} mins`;
  };

  const handleJoin = (session) => {
    setJoiningSessionId(session.id);
    setMessage("");
    setError("");

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await api.post(
          `/online-supervision/join/${session.id}`,
          {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          { headers }
        );

        setJoinUrl(res.data.join_url);
        setMessage("Verified. Joining...");
      } catch (err) {
        setError(err?.response?.data?.message || "Verification failed");
      } finally {
        setJoiningSessionId(null);
      }
    }, () => {
      setError("Location permission is required to join this session.");
      setJoiningSessionId(null);
    });
  };

  const panelStyle = {
    backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
    border: `1px solid ${isDark ? "#2a203a" : "#e5e4e7"}`,
  };

  const mutedTextStyle = {
    color: isDark ? "rgba(255,255,255,0.72)" : "rgba(8,6,13,0.68)",
  };

  return (
    <AppLayout title="Online Supervision" subtitle="Student Sessions">
      <div className="space-y-4">
        {message && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              backgroundColor: isDark ? "rgba(34,197,94,0.18)" : "#dcfce7",
              color: isDark ? "#86efac" : "#166534",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              backgroundColor: isDark ? "rgba(239,68,68,0.18)" : "#fee2e2",
              color: isDark ? "#fca5a5" : "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        {loadingSessions ? (
          <div className="rounded-2xl p-5" style={panelStyle}>
            <p style={mutedTextStyle}>Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-2xl p-5" style={panelStyle}>
            <h3 className="font-semibold text-lg mb-2">No sessions yet</h3>
            <p className="text-sm" style={mutedTextStyle}>
              Your scheduled online supervision sessions will appear here.
            </p>
          </div>
        ) : (
          sessions.map((s) => {
            const isJoining = joiningSessionId === s.id;

            return (
              <div key={s.id} className="p-5 rounded-2xl" style={panelStyle}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{s.title}</h3>
                    <p className="text-sm mt-1" style={mutedTextStyle}>
                      {new Date(s.scheduled_at).toLocaleString()}
                    </p>
                    <p className="text-sm mt-1" style={mutedTextStyle}>
                      Starts in: {getCountdown(s.scheduled_at)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJoin(s)}
                    disabled={isJoining}
                    className="px-5 py-2 rounded-xl font-semibold"
                    style={{
                      backgroundColor: "#aa3bff",
                      color: "#ffffff",
                    }}
                  >
                    {isJoining ? "Verifying..." : "Join"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {joinUrl && (
        <iframe
          src={joinUrl}
          title="Online supervision session"
          className="w-full h-[600px] mt-6 rounded-2xl"
          style={panelStyle}
          allow="camera; microphone"
        />
      )}
    </AppLayout>
  );
}

export default StudentOnlineSupervisionPage;
