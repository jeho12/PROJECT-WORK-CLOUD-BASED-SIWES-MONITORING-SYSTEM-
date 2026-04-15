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
  const [loading, setLoading] = useState(true);

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentWeeks, setStudentWeeks] = useState([]);
  const [selectedWeekId, setSelectedWeekId] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDayId, setSelectedDayId] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);

  const [reviewForm, setReviewForm] = useState({
    review_status: "approved",
    supervisor_comment: "",
    supervisor_name: "",
    supervisor_rank: "",
  });

  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [generatingAiFor, setGeneratingAiFor] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingWeeks, setLoadingWeeks] = useState(false);
  const [loadingWeekDetails, setLoadingWeekDetails] = useState(false);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchSupervisorDashboard = async () => {
    try {
      setError("");
      const response = await api.get("/supervisor/dashboard", {
        headers: authHeaders,
      });

      setData({
        students: response.data.students || [],
        submitted_weeks: response.data.submitted_weeks || [],
      });
    } catch (err) {
      console.error("Supervisor dashboard error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load supervisor dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSupervisorDashboard();
    }
  }, [token]);

  const pendingReviews = data.submitted_weeks.filter(
    (item) =>
      !item.weekly_report ||
      item.weekly_report.review_status === "pending" ||
      item.status === "submitted"
  );

  const handleStudentSelect = async (studentId) => {
    setSelectedStudentId(studentId);
    setSelectedWeekId("");
    setSelectedWeek(null);
    setSelectedDayId("");
    setSelectedDay(null);
    setStudentWeeks([]);

    if (!studentId) return;

    try {
      setLoadingWeeks(true);
      setError("");
      setMessage("");

      const response = await api.get(`/supervisor/student/${studentId}/weeks`, {
        headers: authHeaders,
      });

      setStudentWeeks(response.data.weeks || []);
    } catch (err) {
      console.error("Student weeks error:", err);
      setError(err?.response?.data?.message || "Failed to load student weeks.");
    } finally {
      setLoadingWeeks(false);
    }
  };

  const handleWeekSelect = async (weekId) => {
    setSelectedWeekId(weekId);
    setSelectedDayId("");
    setSelectedDay(null);

    if (!weekId) {
      setSelectedWeek(null);
      return;
    }

    try {
      setLoadingWeekDetails(true);
      setError("");
      setMessage("");

      const response = await api.get(`/supervisor/week/${weekId}`, {
        headers: authHeaders,
      });

      const week = response.data.week;
      setSelectedWeek(week);

      setReviewForm({
        review_status: week?.weekly_report?.review_status || "approved",
        supervisor_comment: week?.weekly_report?.supervisor_comment || "",
        supervisor_name: week?.weekly_report?.supervisor_name || user?.name || "",
        supervisor_rank: week?.weekly_report?.supervisor_rank || "",
      });
    } catch (err) {
      console.error("Week details error:", err);
      setError(err?.response?.data?.message || "Failed to load week details.");
    } finally {
      setLoadingWeekDetails(false);
    }
  };

  const handleDaySelect = (dayId) => {
    setSelectedDayId(dayId);

    if (!dayId || !selectedWeek?.days?.length) {
      setSelectedDay(null);
      return;
    }

    const day = selectedWeek.days.find((item) => String(item.id) === String(dayId));
    setSelectedDay(day || null);
  };

  const handleReviewChange = (e) => {
    setReviewForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedWeek?.id) return;

    try {
      setSubmittingReview(true);
      setError("");
      setMessage("");

      const response = await api.post(
        `/supervisor/week/${selectedWeek.id}/review`,
        reviewForm,
        {
          headers: authHeaders,
        }
      );

      setMessage(response.data.message || "Review submitted successfully.");

      await fetchSupervisorDashboard();
      await handleWeekSelect(selectedWeek.id);
    } catch (err) {
      console.error("Review submit error:", err);
      setError(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleGenerateAI = async (studentId) => {
    try {
      setGeneratingAiFor(studentId);
      setMessage("");
      setError("");

      await api.post(
        `/ai-review/${studentId}`,
        {},
        {
          headers: authHeaders,
        }
      );

      setMessage("AI review generated successfully.");
    } catch (err) {
      console.error("Generate AI error:", err);
      setError(err?.response?.data?.message || "Failed to generate AI review.");
    } finally {
      setGeneratingAiFor(null);
    }
  };

  const handleViewAI = async (studentId) => {
    try {
      setError("");
      setMessage("");

      const response = await api.get(`/ai-review/${studentId}`, {
        headers: authHeaders,
      });

      if (!response.data) {
        setError("No AI review found yet for this student.");
        return;
      }

      setSelectedReview(response.data);
      setShowReviewModal(true);
    } catch (err) {
      console.error("View AI error:", err);
      setError(err?.response?.data?.message || "Failed to load AI review.");
    }
  };

 const handleExportAIReview = () => {
  if (!selectedReview) return;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;

  const summary = selectedReview.summary || "No summary available.";

  const content = `
    <html>
      <head>
        <title>AI_Review_${selectedReview.student_id}_${selectedReview.month}_${selectedReview.year}</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            padding: 40px;
            line-height: 1.7;
            color: #111827;
            background: #ffffff;
          }

          .header {
            border-bottom: 2px solid #7c3aed;
            padding-bottom: 16px;
            margin-bottom: 28px;
          }

          .brand {
            font-size: 12px;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: #7c3aed;
            font-weight: 700;
            margin-bottom: 8px;
          }

          h1 {
            margin: 0;
            font-size: 30px;
            color: #111827;
          }

          .meta {
            margin-top: 10px;
            font-size: 14px;
            color: #4b5563;
          }

          .section {
            margin-bottom: 24px;
          }

          .section-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 10px;
            color: #111827;
          }

          .card {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 18px;
            background: #fafafa;
          }

          .label {
            font-weight: 700;
            color: #111827;
          }

          .summary {
            white-space: pre-wrap;
            font-size: 15px;
            color: #1f2937;
          }

          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
          }

          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">SIWES System</div>
          <h1>Monthly AI Review Report</h1>
          <div class="meta">
            Student ID: ${selectedReview.student_id}<br />
            Month: ${selectedReview.month}<br />
            Year: ${selectedReview.year}<br />
            Generated At: ${selectedReview.created_at || ""}
          </div>
        </div>

        <div class="section">
          <div class="section-title">AI Evaluation Summary</div>
          <div class="card">
            <div class="summary">${summary
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")}</div>
          </div>
        </div>

        <div class="footer">
          This document was generated from the Cloud-Based SIWES Logbook Application.
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
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
        Loading supervisor dashboard...
      </div>
    );
  }

  return (
    <AppLayout
      title="Supervisor"
      subtitle={`Welcome, ${user?.name || "Supervisor"}`}
    >
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

        {/* Section A — Stats */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
          >
            <h3 className="font-semibold text-lg mb-2">Assigned Students</h3>
            <p className="text-3xl font-bold">{data.students.length}</p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
          >
            <h3 className="font-semibold text-lg mb-2">Submitted Weeks</h3>
            <p className="text-3xl font-bold">{data.submitted_weeks.length}</p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
          >
            <h3 className="font-semibold text-lg mb-2">Pending Reviews</h3>
            <p className="text-3xl font-bold">{pendingReviews.length}</p>
          </div>
        </div>

        {/* Section B — Pending Reviews */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
        >
          <h3 className="font-semibold text-xl mb-4">Pending Reviews</h3>

          {pendingReviews.length === 0 ? (
            <p className="opacity-70">No pending weekly reviews at the moment.</p>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map((week) => (
                <div
                  key={week.id}
                  className="rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  style={{ backgroundColor: isDark ? "#120d1d" : "#fff" }}
                >
                  <div>
                    <h4 className="font-semibold">
                      {week.user?.name || "Student"}
                    </h4>
                    <p className="text-sm opacity-80">
                      {week.week_start_date} → {week.week_end_date}
                    </p>
                    <p className="text-sm opacity-80">
                      Review Status:{" "}
                      {week.weekly_report?.review_status || "pending"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(String(week.user?.id || ""));
                      handleStudentSelect(String(week.user?.id || ""));
                      handleWeekSelect(week.id);
                    }}
                    className="rounded-xl px-5 py-3 font-semibold"
                    style={{
                      backgroundColor: "#aa3bff",
                      color: "#fff",
                    }}
                  >
                    Open Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section C — Students */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
        >
          <h3 className="font-semibold text-xl mb-4">Assigned Students</h3>

          {data.students.length === 0 ? (
            <p className="opacity-70">No students assigned yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {data.students.map((student) => (
                <div
                  key={student.id}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: isDark ? "#120d1d" : "#fff" }}
                >
                  <h4 className="font-semibold">{student.user?.name}</h4>
                  <p className="text-sm opacity-80">{student.user?.email}</p>
                  <p className="text-sm opacity-80 mt-2">
                    Matric: {student.matric_number || "N/A"}
                  </p>
                  <p className="text-sm opacity-80">
                    Department: {student.department || "N/A"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleGenerateAI(student.user?.id)}
                      disabled={generatingAiFor === student.user?.id}
                      className="rounded-xl px-4 py-2 font-semibold"
                      style={{
                        backgroundColor: "#aa3bff",
                        color: "#fff",
                      }}
                    >
                      {generatingAiFor === student.user?.id
                        ? "Generating..."
                        : "Generate AI Review"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleViewAI(student.user?.id)}
                      className="rounded-xl px-4 py-2 font-semibold"
                      style={{
                        backgroundColor: isDark ? "#2a203a" : "#e5e4e7",
                        color: isDark ? "#fff" : "#08060d",
                      }}
                    >
                      View AI Review
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStudentSelect(String(student.user?.id || ""))}
                      className="rounded-xl px-4 py-2 font-semibold"
                      style={{
                        backgroundColor: isDark ? "#1f1630" : "#f0ebfa",
                        color: isDark ? "#fff" : "#08060d",
                      }}
                    >
                      Pick Student
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student / Week / Day Picker + Detailed Review */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
        >
          <h3 className="font-semibold text-xl mb-4">Detailed Review Workspace</h3>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <select
              value={selectedStudentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full rounded-xl px-4 py-3 outline-none"
              style={{
                backgroundColor: isDark ? "#120d1d" : "#fff",
                color: isDark ? "#fff" : "#08060d",
              }}
            >
              <option value="">Select Student</option>
              {data.students.map((student) => (
                <option key={student.id} value={student.user?.id}>
                  {student.user?.name}
                </option>
              ))}
            </select>

            <select
              value={selectedWeekId}
              onChange={(e) => handleWeekSelect(e.target.value)}
              disabled={!selectedStudentId || loadingWeeks}
              className="w-full rounded-xl px-4 py-3 outline-none"
              style={{
                backgroundColor: isDark ? "#120d1d" : "#fff",
                color: isDark ? "#fff" : "#08060d",
              }}
            >
              <option value="">
                {loadingWeeks ? "Loading weeks..." : "Select Week"}
              </option>
              {studentWeeks.map((week) => (
                <option key={week.id} value={week.id}>
                  {week.week_start_date} → {week.week_end_date}
                </option>
              ))}
            </select>

            <select
              value={selectedDayId}
              onChange={(e) => handleDaySelect(e.target.value)}
              disabled={!selectedWeek || loadingWeekDetails}
              className="w-full rounded-xl px-4 py-3 outline-none"
              style={{
                backgroundColor: isDark ? "#120d1d" : "#fff",
                color: isDark ? "#fff" : "#08060d",
              }}
            >
              <option value="">
                {loadingWeekDetails ? "Loading days..." : "Select Day"}
              </option>
              {selectedWeek?.days?.map((day) => (
                <option key={day.id} value={day.id}>
                  {day.day_name} · {String(day.date).slice(0, 10)}
                </option>
              ))}
            </select>
          </div>

          {selectedWeek && (
            <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
              <div className="space-y-6">
                {/* Single Day Focus */}
                {selectedDay ? (
                  <div
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: isDark ? "#120d1d" : "#fff" }}
                  >
                    <h4 className="font-semibold text-xl mb-4">Selected Day</h4>

                    <div
                      className="rounded-xl p-4"
                      style={{
                        backgroundColor: isDark ? "#0c0914" : "#f7f7f7",
                        border: isDark
                          ? "1px solid #2a203a"
                          : "1px solid #e5e4e7",
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                        <h5 className="font-semibold">
                          {selectedDay.day_name} · {String(selectedDay.date).slice(0, 10)}
                        </h5>
                        <p className="text-sm opacity-80">
                          {selectedDay.time_in || "--"} - {selectedDay.time_out || "--"}
                        </p>
                      </div>

                      <p className="text-sm opacity-90 whitespace-pre-wrap mb-4">
                        {selectedDay.activity || "No activity entered."}
                      </p>

                      <div className="space-y-2 text-sm mb-4">
                        <p>
                          <strong>Check-in:</strong>{" "}
                          {selectedDay.attendance_log?.check_in_time || "N/A"}
                        </p>
                        <p>
                          <strong>Check-out:</strong>{" "}
                          {selectedDay.attendance_log?.check_out_time || "N/A"}
                        </p>
                        <p>
                          <strong>Check-in Address:</strong>{" "}
                          {selectedDay.attendance_log?.check_in_address || "N/A"}
                        </p>
                        <p>
                          <strong>Check-out Address:</strong>{" "}
                          {selectedDay.attendance_log?.check_out_address || "N/A"}
                        </p>
                      </div>

                      {selectedDay.attachments?.length > 0 && (
                        <div>
                          <p className="font-medium mb-2">Attachments</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedDay.attachments.map((file) => (
                              <a
                                key={file.id}
                                href={file.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg px-3 py-2 text-sm font-medium"
                                style={{
                                  backgroundColor: "#aa3bff",
                                  color: "#fff",
                                }}
                              >
                                {file.file_name}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Whole Week Daily Logs */}
                <div
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: isDark ? "#120d1d" : "#fff" }}
                >
                  <h4 className="font-semibold text-xl mb-4">Weekly Logs</h4>

                  <div className="space-y-4">
                    {selectedWeek.days?.length ? (
                      selectedWeek.days.map((day) => (
                        <div
                          key={day.id}
                          className="rounded-xl p-4"
                          style={{
                            backgroundColor: isDark ? "#0c0914" : "#f7f7f7",
                            border: isDark
                              ? "1px solid #2a203a"
                              : "1px solid #e5e4e7",
                          }}
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                            <h5 className="font-semibold">
                              {day.day_name} · {String(day.date).slice(0, 10)}
                            </h5>
                            <p className="text-sm opacity-80">
                              {day.time_in || "--"} - {day.time_out || "--"}
                            </p>
                          </div>

                          <p className="text-sm opacity-90 whitespace-pre-wrap">
                            {day.activity || "No activity entered."}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="opacity-70">No daily entries found.</p>
                    )}
                  </div>
                </div>

                {/* Weekly Report */}
                <div
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: isDark ? "#120d1d" : "#fff" }}
                >
                  <h4 className="font-semibold text-xl mb-4">Weekly Report</h4>

                  <div className="space-y-3 text-sm">
                    <p>
                      <strong>Projects:</strong>{" "}
                      {selectedWeek.weekly_report?.projects || "N/A"}
                    </p>
                    <p>
                      <strong>Section / Department:</strong>{" "}
                      {selectedWeek.weekly_report?.section_department || "N/A"}
                    </p>
                    <p>
                      <strong>Student Comment:</strong>{" "}
                      {selectedWeek.weekly_report?.student_comment || "N/A"}
                    </p>
                    <div>
                      <p className="font-semibold mb-1">Work Done</p>
                      <p className="opacity-90 whitespace-pre-wrap">
                        {selectedWeek.weekly_report?.work_done || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Full Attendance */}
                <div
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: isDark ? "#120d1d" : "#fff" }}
                >
                  <h4 className="font-semibold text-xl mb-4">Attendance</h4>

                  <div className="space-y-4">
                    {selectedWeek.days?.length ? (
                      selectedWeek.days.map((day) => (
                        <div
                          key={`attendance-${day.id}`}
                          className="rounded-xl p-4"
                          style={{
                            backgroundColor: isDark ? "#0c0914" : "#f7f7f7",
                          }}
                        >
                          <p className="font-medium mb-1">
                            {day.day_name} · {String(day.date).slice(0, 10)}
                          </p>
                          <p className="text-sm opacity-80">
                            Check-in: {day.attendance_log?.check_in_time || "N/A"}
                          </p>
                          <p className="text-sm opacity-80">
                            Check-out: {day.attendance_log?.check_out_time || "N/A"}
                          </p>
                          <p className="text-sm opacity-80">
                            Check-in Address:{" "}
                            {day.attendance_log?.check_in_address || "N/A"}
                          </p>
                          <p className="text-sm opacity-80">
                            Check-out Address:{" "}
                            {day.attendance_log?.check_out_address || "N/A"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="opacity-70">No attendance logs found.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Approve / Reject */}
              <div>
                <div
                  className="rounded-2xl p-5 sticky top-4"
                  style={{ backgroundColor: isDark ? "#120d1d" : "#fff" }}
                >
                  <h4 className="font-semibold text-xl mb-4">
                    Approve / Reject
                  </h4>

                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <select
                      name="review_status"
                      value={reviewForm.review_status}
                      onChange={handleReviewChange}
                      className="w-full rounded-xl px-4 py-3 outline-none"
                      style={{
                        backgroundColor: isDark ? "#0c0914" : "#f7f7f7",
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
                      value={reviewForm.supervisor_name}
                      onChange={handleReviewChange}
                      className="w-full rounded-xl px-4 py-3 outline-none"
                      style={{
                        backgroundColor: isDark ? "#0c0914" : "#f7f7f7",
                        color: isDark ? "#fff" : "#08060d",
                      }}
                    />

                    <input
                      type="text"
                      name="supervisor_rank"
                      placeholder="Supervisor Rank / Position"
                      value={reviewForm.supervisor_rank}
                      onChange={handleReviewChange}
                      className="w-full rounded-xl px-4 py-3 outline-none"
                      style={{
                        backgroundColor: isDark ? "#0c0914" : "#f7f7f7",
                        color: isDark ? "#fff" : "#08060d",
                      }}
                    />

                    <textarea
                      name="supervisor_comment"
                      placeholder="Supervisor Comment"
                      value={reviewForm.supervisor_comment}
                      onChange={handleReviewChange}
                      rows="8"
                      className="w-full rounded-xl px-4 py-3 outline-none"
                      style={{
                        backgroundColor: isDark ? "#0c0914" : "#f7f7f7",
                        color: isDark ? "#fff" : "#08060d",
                      }}
                    />

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full rounded-xl px-6 py-3 font-semibold"
                      style={{
                        backgroundColor: "#aa3bff",
                        color: "#fff",
                      }}
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Review Modal */}
        {showReviewModal && selectedReview && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div
              className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-6"
              style={{ backgroundColor: isDark ? "#120d1d" : "#fff" }}
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold" style={{ color: "#aa3bff" }}>
                  AI Monthly Evaluation
                </h2>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleExportAIReview}
                    className="rounded-xl px-4 py-2 font-semibold"
                    style={{
                      backgroundColor: "#aa3bff",
                      color: "#fff",
                    }}
                  >
                    Export as PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="rounded-xl px-4 py-2 font-semibold"
                    style={{
                      backgroundColor: isDark ? "#2a203a" : "#e5e4e7",
                      color: isDark ? "#fff" : "#08060d",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <p>
                  <strong>Student ID:</strong> {selectedReview.student_id}
                </p>
                <p>
                  <strong>Month:</strong> {selectedReview.month}
                </p>
                <p>
                  <strong>Year:</strong> {selectedReview.year}
                </p>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Summary</h3>
                  <p className="opacity-90 whitespace-pre-wrap">
                    {selectedReview.summary || "No summary available."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default SupervisorDashboardPage;