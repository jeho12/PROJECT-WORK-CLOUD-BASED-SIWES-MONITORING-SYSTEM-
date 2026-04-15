import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AppLayout from "../layouts/AppLayout";

function LogbookPage() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [todayData, setTodayData] = useState(null);
  const [history, setHistory] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState(null);

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

  const [attachmentFile, setAttachmentFile] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingDaily, setSavingDaily] = useState(false);
  const [savingWeekly, setSavingWeekly] = useState(false);
  const [submittingWeek, setSubmittingWeek] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [removingAttachmentId, setRemovingAttachmentId] = useState(null);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const currentDayEntry = useMemo(() => {
    if (!todayData?.week?.days || !todayData?.today) return null;

    return (
      todayData.week.days.find((item) => {
        const itemDate =
          typeof item.date === "string"
            ? item.date.slice(0, 10)
            : new Date(item.date).toISOString().slice(0, 10);

        return itemDate === todayData.today;
      }) || todayData.today_entry || null
    );
  }, [todayData]);

  const fetchToday = async () => {
    const response = await api.get("/logbook/today", {
      headers: authHeaders,
    });

    setTodayData(response.data);

    if (response.data.today_entry) {
      setFormData({
        time_in: response.data.today_entry.time_in
          ? response.data.today_entry.time_in.slice(0, 5)
          : "",
        time_out: response.data.today_entry.time_out
          ? response.data.today_entry.time_out.slice(0, 5)
          : "",
        activity: response.data.today_entry.activity || "",
      });
    } else {
      setFormData({
        time_in: "",
        time_out: "",
        activity: "",
      });
    }

    if (response.data.week?.id) {
      try {
        const weekResponse = await api.get(
          `/logbook/week/${response.data.week.id}`,
          {
            headers: authHeaders,
          }
        );

        if (weekResponse.data.report) {
          setWeeklyData({
            projects: weekResponse.data.report.projects || "",
            section_department:
              weekResponse.data.report.section_department || "",
            student_comment: weekResponse.data.report.student_comment || "",
            work_done: weekResponse.data.report.work_done || "",
          });
        } else {
          setWeeklyData({
            projects: "",
            section_department: "",
            student_comment: "",
            work_done: "",
          });
        }
      } catch (err) {
        console.error("Week detail load error:", err);
      }
    } else {
      setWeeklyData({
        projects: "",
        section_department: "",
        student_comment: "",
        work_done: "",
      });
    }
  };

  const fetchHistory = async () => {
    const response = await api.get("/logbook/history", {
      headers: authHeaders,
    });

    setHistory(response.data.weeks || []);
  };

  const fetchAttendanceStatus = async () => {
    const response = await api.get("/attendance/status", {
      headers: authHeaders,
    });

    setAttendanceStatus(response.data.attendance || null);
  };

  const initializePage = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    const results = await Promise.allSettled([
      fetchToday(),
      fetchHistory(),
      fetchAttendanceStatus(),
    ]);

    const realFailures = results.filter((result) => {
      if (result.status !== "rejected") return false;

      const reason = result.reason;
      const code = reason?.code || "";
      const name = reason?.name || "";
      const message = reason?.message || "";

      if (
        code === "ERR_CANCELED" ||
        name === "CanceledError" ||
        message.toLowerCase().includes("canceled")
      ) {
        return false;
      }

      return true;
    });

    if (realFailures.length === 0) {
      setError("");
    } else {
      console.error("Logbook partial load errors:", realFailures);
      setError("Some dashboard data could not be loaded completely.");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!token) return;
    initializePage();
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

  const getCurrentPosition = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported on this device."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (geoError) => {
          reject(
            new Error(geoError?.message || "Unable to get your location.")
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });

  const saveDailyLog = async (e) => {
    e.preventDefault();
    setSavingDaily(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/logbook/today", formData, {
        headers: authHeaders,
      });

      setMessage(response.data.message);
      await Promise.all([
        fetchToday(),
        fetchHistory(),
        fetchAttendanceStatus(),
      ]);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save daily log.");
    } finally {
      setSavingDaily(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setMessage("");
    setError("");

    try {
      const position = await getCurrentPosition();

      const response = await api.post("/attendance/check-in", position, {
        headers: authHeaders,
      });

      setMessage(response.data.message);
      await Promise.all([
        fetchAttendanceStatus(),
        fetchToday(),
        fetchHistory(),
      ]);
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Check-in failed."
      );
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    setMessage("");
    setError("");

    try {
      const position = await getCurrentPosition();

      const response = await api.post("/attendance/check-out", position, {
        headers: authHeaders,
      });

      setMessage(response.data.message);
      await Promise.all([
        fetchAttendanceStatus(),
        fetchToday(),
        fetchHistory(),
      ]);
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Check-out failed."
      );
    } finally {
      setCheckingOut(false);
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
          headers: authHeaders,
        }
      );

      setMessage(response.data.message);
      await Promise.all([fetchToday(), fetchHistory()]);
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to save weekly report."
      );
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
          headers: authHeaders,
        }
      );

      setMessage(response.data.message);
      await Promise.all([
        fetchToday(),
        fetchHistory(),
        fetchAttendanceStatus(),
      ]);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit week.");
    } finally {
      setSubmittingWeek(false);
    }
  };

  const uploadAttachment = async () => {
    if (!attachmentFile) {
      setError("Please choose a file first.");
      return;
    }

    if (!currentDayEntry?.id) {
      setError("Save today’s log first before uploading attachments.");
      return;
    }

    setUploadingAttachment(true);
    setMessage("");
    setError("");

    try {
      const payload = new FormData();
      payload.append("file", attachmentFile);

      const response = await api.post(
        `/logbook/day/${currentDayEntry.id}/attachments`,
        payload,
        {
          headers: {
            ...authHeaders,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message);
      setAttachmentFile(null);

      const fileInput = document.getElementById("logbook-attachment-input");
      if (fileInput) fileInput.value = "";

      await Promise.all([fetchToday(), fetchHistory()]);
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to upload attachment."
      );
    } finally {
      setUploadingAttachment(false);
    }
  };

  const removeAttachment = async (attachmentId) => {
    setRemovingAttachmentId(attachmentId);
    setMessage("");
    setError("");

    try {
      const response = await api.delete(
        `/logbook/attachments/${attachmentId}`,
        {
          headers: authHeaders,
        }
      );

      setMessage(response.data.message);
      await Promise.all([fetchToday(), fetchHistory()]);
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to remove attachment."
      );
    } finally {
      setRemovingAttachmentId(null);
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
  const canUseWeekly =
    week?.days_completed >= 5 &&
    week?.status !== "submitted" &&
    week?.status !== "approved";
  const isWeekLocked =
    week?.status === "submitted" || week?.status === "approved";

  const attachments = currentDayEntry?.attachments || [];
  const hasCheckedIn = !!attendanceStatus?.check_in_time;
  const hasCheckedOut = !!attendanceStatus?.check_out_time;

  return (
    <AppLayout title="Logbook" subtitle="Daily Logbook and Attendance">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
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
                Attendance
              </p>
              <h2 className="text-3xl font-bold">Check-in / Check-out</h2>
              <p className="opacity-80 mt-2">
                Capture your attendance with GPS, IP, and device information.
              </p>
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

            <div className="grid md:grid-cols-2 gap-4">
              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
              >
                <h3 className="font-semibold mb-2">Today’s Status</h3>
                <p className="text-sm opacity-80 mb-2">
                  Check-in: {attendanceStatus?.check_in_time || "Not yet"}
                </p>
                <p className="text-sm opacity-80 mb-2">
                  Check-out: {attendanceStatus?.check_out_time || "Not yet"}
                </p>
                <p className="text-sm opacity-80">
                  IP:{" "}
                  {attendanceStatus?.ip_address ||
                    "Will be logged automatically"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 items-start">
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={checkingIn || hasCheckedIn}
                  className="rounded-xl px-6 py-3 font-semibold"
                  style={{
                    backgroundColor: "#aa3bff",
                    color: "#fff",
                    opacity: hasCheckedIn ? 0.6 : 1,
                  }}
                >
                  {checkingIn ? "Checking in..." : "Check In"}
                </button>

                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={checkingOut || !hasCheckedIn || hasCheckedOut}
                  className="rounded-xl px-6 py-3 font-semibold"
                  style={{
                    backgroundColor: isDark ? "#1a1426" : "#e5e4e7",
                    color: isDark ? "#fff" : "#08060d",
                    opacity: !hasCheckedIn || hasCheckedOut ? 0.6 : 1,
                  }}
                >
                  {checkingOut ? "Checking out..." : "Check Out"}
                </button>
              </div>
            </div>
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
                Daily Logbook
              </p>
              <h2 className="text-3xl font-bold">Today’s Entry</h2>
              <p className="opacity-80 mt-2">
                {todayData?.day_name
                  ? `${todayData.day_name.charAt(0).toUpperCase()}${todayData.day_name.slice(1)} · ${todayData.today}`
                  : "Today"}
              </p>
            </div>

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
                Evidence Upload
              </p>
              <h2 className="text-3xl font-bold">Attachments</h2>
              <p className="opacity-80 mt-2">
                Upload image, PDF, or document evidence for today’s entry.
              </p>
            </div>

            {!currentDayEntry?.id ? (
              <div className="rounded-xl px-4 py-4 bg-yellow-500/20 text-yellow-300 text-sm">
                Save today’s log first before uploading attachments.
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <input
                    id="logbook-attachment-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    onChange={(e) =>
                      setAttachmentFile(e.target.files?.[0] || null)
                    }
                    className="block w-full text-sm"
                  />

                  <button
                    type="button"
                    onClick={uploadAttachment}
                    disabled={uploadingAttachment || isWeekLocked}
                    className="rounded-xl px-6 py-3 font-semibold"
                    style={{
                      backgroundColor: "#aa3bff",
                      color: "#fff",
                      opacity: isWeekLocked ? 0.6 : 1,
                    }}
                  >
                    {uploadingAttachment ? "Uploading..." : "Upload File"}
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  {attachments.length === 0 ? (
                    <p className="text-sm opacity-70">
                      No attachments uploaded yet.
                    </p>
                  ) : (
                    attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl p-4"
                        style={{
                          backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
                        }}
                      >
                        <div>
                          <p className="font-semibold">{attachment.file_name}</p>
                          <p className="text-sm opacity-70">
                            {attachment.file_type || "File"}{" "}
                            {attachment.file_size
                              ? `· ${(attachment.file_size / 1024).toFixed(1)} KB`
                              : ""}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <a
                            href={attachment.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl px-4 py-2 font-semibold"
                            style={{
                              backgroundColor: "#aa3bff",
                              color: "#fff",
                            }}
                          >
                            View
                          </a>

                          <button
                            type="button"
                            onClick={() => removeAttachment(attachment.id)}
                            disabled={
                              removingAttachmentId === attachment.id ||
                              isWeekLocked
                            }
                            className="rounded-xl px-4 py-2 font-semibold"
                            style={{
                              backgroundColor: isDark ? "#2a1320" : "#fbe4e8",
                              color: isDark ? "#fff" : "#7a1023",
                              opacity: isWeekLocked ? 0.6 : 1,
                            }}
                          >
                            {removingAttachmentId === attachment.id
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
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
                This unlocks after all Monday to Friday entries are completed.
              </p>
            </div>

            {!canUseWeekly && (
              <div className="mb-4 rounded-xl px-4 py-4 bg-yellow-500/20 text-yellow-300 text-sm">
                Complete all required Monday to Friday entries before saving your
                weekly report.
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
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                (day) => {
                  const found = week?.days?.find(
                    (item) =>
                      item.day_name?.toLowerCase() === day.toLowerCase()
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
                }
              )}
            </div>

            <div className="mt-6 text-sm opacity-80 space-y-1">
              <p>
                Status: <strong>{week?.status || "N/A"}</strong>
              </p>
              <p>
                Completed Days: <strong>{week?.days_completed || 0}/5</strong>
              </p>
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
              Attendance Details
            </p>

            <div className="space-y-3 text-sm">
              <div
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
              >
                <p className="font-semibold">Check-in Location</p>
                <p className="opacity-80">
                  {attendanceStatus?.check_in_latitude &&
                  attendanceStatus?.check_in_longitude
                    ? `${attendanceStatus.check_in_latitude}, ${attendanceStatus.check_in_longitude}`
                    : "Not captured yet"}
                </p>
                <p className="opacity-70 text-sm mt-1">
                  {attendanceStatus?.check_in_address ||
                    "Address not resolved yet"}
                </p>
              </div>

              <div
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
              >
                <p className="font-semibold">Check-out Location</p>
                <p className="opacity-80">
                  {attendanceStatus?.check_out_latitude &&
                  attendanceStatus?.check_out_longitude
                    ? `${attendanceStatus.check_out_latitude}, ${attendanceStatus.check_out_longitude}`
                    : "Not captured yet"}
                </p>
                <p className="opacity-70 text-sm mt-1">
                  {attendanceStatus?.check_out_address ||
                    "Address not resolved yet"}
                </p>
              </div>

              <div
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: isDark ? "#1a1426" : "#f7f7f7" }}
              >
                <p className="font-semibold">Device / Browser</p>
                <p className="opacity-80 break-words">
                  {attendanceStatus?.device_info ||
                    "Will be logged automatically"}
                </p>
              </div>
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
                      Days: {item.days?.length || 0}/5
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default LogbookPage;