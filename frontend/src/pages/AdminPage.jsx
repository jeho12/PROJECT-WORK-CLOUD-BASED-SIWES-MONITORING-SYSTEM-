import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AppLayout from "../layouts/AppLayout";

function AdminPage() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [students, setStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [assigningId, setAssigningId] = useState(null);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const fetchData = async () => {
    try {
      setError("");

      const [studentsRes, supervisorsRes] = await Promise.all([
        api.get("/admin/students", { headers: authHeaders }),
        api.get("/admin/supervisors", { headers: authHeaders }),
      ]);

      setStudents(studentsRes.data.students || []);
      setSupervisors(supervisorsRes.data.supervisors || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const createSupervisor = async () => {
    setCreating(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/admin/supervisors", form, {
        headers: authHeaders,
      });

      setMessage(response.data.message || "Supervisor created successfully.");
      setForm({
        name: "",
        email: "",
        password: "",
      });

      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create supervisor.");
    } finally {
      setCreating(false);
    }
  };

  const assignSupervisor = async (studentProfileId, supervisorId) => {
    if (!supervisorId) return;

    setAssigningId(studentProfileId);
    setMessage("");
    setError("");

    try {
      const response = await api.post(
        "/admin/assign-supervisor",
        {
          student_profile_id: Number(studentProfileId),
          supervisor_id: Number(supervisorId),
        },
        {
          headers: authHeaders,
        }
      );

      setMessage(response.data.message || "Supervisor assigned successfully.");
      await fetchData();
    } catch (err) {
      console.error("Assign supervisor error:", err?.response?.data || err);
      setError(
        err?.response?.data?.message || "Failed to assign supervisor."
      );
    } finally {
      setAssigningId(null);
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
        Loading admin panel...
      </div>
    );
  }

  return (
    <AppLayout title="Admin Panel" subtitle="Manage Supervisors & Students">
      <div className="space-y-6">
        {message && (
          <div className="rounded-xl px-4 py-3 bg-green-500/20 text-green-300 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl px-4 py-3 bg-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
        >
          <h3 className="font-semibold text-xl mb-4">Create New Supervisor</h3>

          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl px-4 py-3 outline-none"
              style={{
                backgroundColor: isDark ? "#120d1d" : "#fff",
                color: isDark ? "#fff" : "#08060d",
              }}
            />

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-xl px-4 py-3 outline-none"
              style={{
                backgroundColor: isDark ? "#120d1d" : "#fff",
                color: isDark ? "#fff" : "#08060d",
              }}
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-xl px-4 py-3 outline-none"
              style={{
                backgroundColor: isDark ? "#120d1d" : "#fff",
                color: isDark ? "#fff" : "#08060d",
              }}
            />

            <button
              type="button"
              onClick={createSupervisor}
              disabled={creating}
              className="rounded-xl px-6 py-3 font-semibold"
              style={{
                backgroundColor: "#aa3bff",
                color: "#fff",
              }}
            >
              {creating ? "Creating..." : "Add Supervisor"}
            </button>
          </div>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
        >
          <h3 className="font-semibold text-xl mb-4">
            Assign Supervisors to Students
          </h3>

          <div className="space-y-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                style={{ backgroundColor: isDark ? "#120d1d" : "#fff" }}
              >
                <div>
                  <h4 className="font-semibold">{student.user?.name}</h4>
                  <p className="text-sm opacity-80">{student.user?.email}</p>
                  <p className="text-sm opacity-70 mt-1">
                    Current Supervisor:{" "}
                    {student.supervisor?.name || "Not assigned"}
                  </p>
                </div>

                <select
                  value={student.supervisor_id || ""}
                  onChange={(e) => assignSupervisor(student.id, e.target.value)}
                  disabled={assigningId === student.id}
                  className="rounded-xl px-4 py-3 outline-none min-w-[280px]"
                  style={{
                    backgroundColor: isDark ? "#0f0a17" : "#fff",
                    color: isDark ? "#fff" : "#08060d",
                    border: "1px solid #aa3bff",
                  }}
                >
                  <option value="">Select Supervisor</option>
                  {supervisors.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default AdminPage;