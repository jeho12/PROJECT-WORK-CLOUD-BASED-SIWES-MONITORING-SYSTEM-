import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AppLayout from "../layouts/AppLayout";

function AdminPage() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [stats, setStats] = useState({
    total_students: 0,
    total_supervisors: 0,
    submitted_weeks: 0,
    pending_reviews: 0,
    active_students: 0,
    inactive_students: 0,
  });

  const [students, setStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    department: "",
    level: "",
    status: "",
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [assigningId, setAssigningId] = useState(null);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchData = async () => {
    try {
      setError("");

      const [dashboardRes, studentsRes, supervisorsRes] = await Promise.all([
        api.get("/admin/dashboard", { headers: authHeaders }),
        api.get("/admin/students", { headers: authHeaders }),
        api.get("/admin/supervisors", { headers: authHeaders }),
      ]);

      setStats(dashboardRes.data.stats || {});
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

  const departments = [...new Set(students.map((s) => s.department).filter(Boolean))];
  const levels = [...new Set(students.map((s) => s.level).filter(Boolean))];

  const filteredStudents = students.filter((student) => {
    const matchSearch =
      !filters.search ||
      student.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      student.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      student.matric_number?.toLowerCase().includes(filters.search.toLowerCase());

    const matchDepartment =
      !filters.department || student.department === filters.department;

    const matchLevel = !filters.level || String(student.level) === String(filters.level);

    const matchStatus =
      !filters.status ||
      (filters.status === "active" && student.is_active) ||
      (filters.status === "inactive" && !student.is_active);

    return matchSearch && matchDepartment && matchLevel && matchStatus;
  });

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

        {/* Stats */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
          >
            <h3 className="font-semibold text-lg mb-2">Total Students</h3>
            <p className="text-3xl font-bold">{stats.total_students}</p>
            <p className="text-sm opacity-80 mt-2">
              Active: {stats.active_students} · Inactive: {stats.inactive_students}
            </p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
          >
            <h3 className="font-semibold text-lg mb-2">Total Supervisors</h3>
            <p className="text-3xl font-bold">{stats.total_supervisors}</p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
          >
            <h3 className="font-semibold text-lg mb-2">Weekly Review Overview</h3>
            <p className="text-3xl font-bold">{stats.submitted_weeks}</p>
            <p className="text-sm opacity-80 mt-2">
              Pending Reviews: {stats.pending_reviews}
            </p>
          </div>
        </div>

        {/* Create Supervisor */}
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

        {/* Supervisor monitoring */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
        >
          <h3 className="font-semibold text-xl mb-4">Supervisor Monitoring</h3>

          {supervisors.length === 0 ? (
            <p className="opacity-70">No supervisors found.</p>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {supervisors.map((supervisor) => (
                <div
                  key={supervisor.id}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: isDark ? "#120d1d" : "#fff" }}
                >
                  <h4 className="font-semibold">{supervisor.name}</h4>
                  <p className="text-sm opacity-80">{supervisor.email}</p>
                  <div className="mt-3 text-sm opacity-80 space-y-1">
                    <p>Assigned Students: {supervisor.assigned_students_count}</p>
                    <p>Pending Reviews: {supervisor.pending_reviews_count}</p>
                    <p>Reviewed Weeks: {supervisor.reviewed_weeks_count}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters + student table */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h3 className="font-semibold text-xl">Student Monitoring</h3>

            <div className="grid md:grid-cols-4 gap-3 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search student"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="rounded-xl px-4 py-3 outline-none"
                style={{
                  backgroundColor: isDark ? "#120d1d" : "#fff",
                  color: isDark ? "#fff" : "#08060d",
                }}
              />

              <select
                value={filters.department}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, department: e.target.value }))
                }
                className="rounded-xl px-4 py-3 outline-none"
                style={{
                  backgroundColor: isDark ? "#120d1d" : "#fff",
                  color: isDark ? "#fff" : "#08060d",
                }}
              >
                <option value="">All Departments</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>

              <select
                value={filters.level}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, level: e.target.value }))
                }
                className="rounded-xl px-4 py-3 outline-none"
                style={{
                  backgroundColor: isDark ? "#120d1d" : "#fff",
                  color: isDark ? "#fff" : "#08060d",
                }}
              >
                <option value="">All Levels</option>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="rounded-xl px-4 py-3 outline-none"
                style={{
                  backgroundColor: isDark ? "#120d1d" : "#fff",
                  color: isDark ? "#fff" : "#08060d",
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredStudents.length === 0 ? (
              <p className="opacity-70">No students match your filters.</p>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="rounded-xl p-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4"
                  style={{ backgroundColor: isDark ? "#120d1d" : "#fff" }}
                >
                  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1">
                    <div>
                      <h4 className="font-semibold">{student.name}</h4>
                      <p className="text-sm opacity-80">{student.email}</p>
                    </div>

                    <div className="text-sm opacity-80">
                      <p>Matric: {student.matric_number || "N/A"}</p>
                      <p>Department: {student.department || "N/A"}</p>
                      <p>Level: {student.level || "N/A"}</p>
                    </div>

                    <div className="text-sm opacity-80">
                      <p>Status: {student.is_active ? "Active" : "Inactive"}</p>
                      <p>Submitted Weeks: {student.submitted_weeks_count}</p>
                      <p>Pending Reviews: {student.pending_reviews_count}</p>
                    </div>

                    <div className="text-sm opacity-80">
                      <p>Organization: {student.organization_name || "N/A"}</p>
                      <p>
                        Supervisor: {student.supervisor?.name || "Not assigned"}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-[280px]">
                    <select
                      value={student.supervisor_id || ""}
                      onChange={(e) => assignSupervisor(student.id, e.target.value)}
                      disabled={assigningId === student.id}
                      className="w-full rounded-xl px-4 py-3 outline-none"
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
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default AdminPage;