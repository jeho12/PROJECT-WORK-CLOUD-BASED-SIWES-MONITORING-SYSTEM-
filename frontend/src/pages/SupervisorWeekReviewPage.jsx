import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AppLayout from "../layouts/AppLayout";

function SupervisorWeekReviewPage() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const { weekId } = useParams();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [week, setWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    review_status: "approved",
    supervisor_comment: "",
    supervisor_name: "",
    supervisor_rank: "",
  });

  useEffect(() => {
    const fetchWeek = async () => {
      try {
        const response = await api.get(`/supervisor/week/${weekId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setWeek(response.data.week);

        if (response.data.week?.weekly_report) {
          setFormData((prev) => ({
            ...prev,
            supervisor_comment:
              response.data.week.weekly_report.supervisor_comment || "",
            supervisor_name:
              response.data.week.weekly_report.supervisor_name || "",
            supervisor_rank:
              response.data.week.weekly_report.supervisor_rank || "",
            review_status:
              response.data.week.weekly_report.review_status || "approved",
          }));
        }
      } catch (error) {
        console.error("Supervisor week fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token && weekId) {
      fetchWeek();
    }
  }, [token, weekId]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.post(`/supervisor/week/${weekId}/review`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/supervisor/dashboard");
    } catch (error) {
      console.error("Review submit error:", error);
    } finally {
      setSaving(false);
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
        Loading submission...
      </div>
    );
  }

  return (
    <AppLayout title="Supervisor Review" subtitle={`Review Weekly Submission`}>
      <div className="space-y-6">
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
        >
          <h3 className="font-semibold text-xl mb-4">Student Information</h3>
          <p><strong>Name:</strong> {week?.user?.name}</p>
          <p><strong>Email:</strong> {week?.user?.email}</p>
          <p><strong>Matric Number:</strong> {week?.user?.student_profile?.matric_number || "N/A"}</p>
          <p><strong>Department:</strong> {week?.user?.student_profile?.department || "N/A"}</p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
        >
          <h3 className="font-semibold text-xl mb-4">Daily Entries</h3>

          <div className="space-y-4">
            {week?.days?.map((day) => (
              <div
                key={day.id}
                className="rounded-xl p-4"
                style={{ backgroundColor: isDark ? "#120d1d" : "#fff" }}
              >
                <h4 className="font-semibold mb-2">{day.day_name} - {String(day.date).slice(0, 10)}</h4>
                <p className="text-sm opacity-80 mb-2">
                  Time: {day.time_in || "--"} - {day.time_out || "--"}
                </p>
                <p className="text-sm opacity-90">{day.activity}</p>

                {day.attachments?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="font-medium">Attachments</p>
                    {day.attachments.map((file) => (
                      <a
                        key={file.id}
                        href={file.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                        style={{ color: "#aa3bff" }}
                      >
                        {file.file_name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
        >
          <h3 className="font-semibold text-xl mb-4">Weekly Report</h3>
          <p className="mb-2"><strong>Projects:</strong> {week?.weekly_report?.projects || "N/A"}</p>
          <p className="mb-2"><strong>Section / Department:</strong> {week?.weekly_report?.section_department || "N/A"}</p>
          <p className="mb-2"><strong>Student Comment:</strong> {week?.weekly_report?.student_comment || "N/A"}</p>
          <p><strong>Work Done:</strong></p>
          <p className="opacity-90 mt-2 whitespace-pre-wrap">{week?.weekly_report?.work_done || "N/A"}</p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
        >
          <h3 className="font-semibold text-xl mb-4">Supervisor Decision</h3>

          <form onSubmit={handleReview} className="space-y-4">
            <select
              name="review_status"
              value={formData.review_status}
              onChange={handleChange}
              className="w-full rounded-xl px-4 py-3 outline-none"
              style={{
                backgroundColor: isDark ? "#120d1d" : "#fff",
                color: isDark ? "#fff" : "#08060d",
              }}
            >
              <option value="approved">Approve</option>
              <option value="rejected">Reject</option>
            </select>

            <input
              type="text"
              name="supervisor_name"
              placeholder="Supervisor Name"
              value={formData.supervisor_name}
              onChange={handleChange}
              className="w-full rounded-xl px-4 py-3 outline-none"
              style={{
                backgroundColor: isDark ? "#120d1d" : "#fff",
                color: isDark ? "#fff" : "#08060d",
              }}
            />

            <input
              type="text"
              name="supervisor_rank"
              placeholder="Supervisor Rank / Position"
              value={formData.supervisor_rank}
              onChange={handleChange}
              className="w-full rounded-xl px-4 py-3 outline-none"
              style={{
                backgroundColor: isDark ? "#120d1d" : "#fff",
                color: isDark ? "#fff" : "#08060d",
              }}
            />

            <textarea
              name="supervisor_comment"
              placeholder="Supervisor Comment"
              value={formData.supervisor_comment}
              onChange={handleChange}
              rows="6"
              className="w-full rounded-xl px-4 py-3 outline-none"
              style={{
                backgroundColor: isDark ? "#120d1d" : "#fff",
                color: isDark ? "#fff" : "#08060d",
              }}
            />

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl px-6 py-3 font-semibold"
              style={{
                backgroundColor: "#aa3bff",
                color: "#fff",
              }}
            >
              {saving ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

export default SupervisorWeekReviewPage;