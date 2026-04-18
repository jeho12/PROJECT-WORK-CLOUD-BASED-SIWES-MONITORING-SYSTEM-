import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../layouts/AppLayout";

function StudentOnlineSupervisionPage() {
  const { token } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [joinUrl, setJoinUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const res = await api.get("/online-supervision/student", { headers });
    setSessions(res.data.sessions);
  };

  const getCountdown = (time) => {
    const diff = new Date(time) - new Date();
    if (diff <= 0) return "Started";

    const mins = Math.floor(diff / 60000);
    return `${mins} mins`;
  };

  const handleJoin = (session) => {
    setLoading(true);

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
        setLoading(false);
      }
    });
  };

  return (
    <AppLayout title="Online Supervision" subtitle="Student Sessions">
      {message && <div className="text-green-400">{message}</div>}
      {error && <div className="text-red-400">{error}</div>}

      {sessions.map((s) => (
        <div key={s.id} className="p-4 bg-[#120d1d] rounded-xl mb-4">
          <h3>{s.title}</h3>
          <p>{new Date(s.scheduled_at).toLocaleString()}</p>
          <p>Starts in: {getCountdown(s.scheduled_at)}</p>

          <button
            onClick={() => handleJoin(s)}
            className="mt-3 bg-purple-600 px-4 py-2 rounded"
          >
            {loading ? "Verifying..." : "Join"}
          </button>
        </div>
      ))}

      {joinUrl && (
        <iframe
          src={joinUrl}
          className="w-full h-[600px] mt-6"
          allow="camera; microphone"
        />
      )}
    </AppLayout>
  );
}

export default StudentOnlineSupervisionPage;