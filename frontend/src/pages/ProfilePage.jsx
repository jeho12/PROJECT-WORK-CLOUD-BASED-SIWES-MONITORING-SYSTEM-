import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AppLayout from "../layouts/AppLayout";

function ProfilePage() {
  const { token, refreshUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [formData, setFormData] = useState({
    matric_number: "",
    department: "",
    faculty: "",
    level: "",
    school_email: "",
    organization_name: "",
    organization_address: "",
    industry_supervisor_name: "",
    industry_supervisor_email: "",
    industry_supervisor_phone: "",
    training_start_date: "",
    training_end_date: "",
  });

  const [passport, setPassport] = useState(null);
  const [passportPreview, setPassportPreview] = useState("");
  const [profileComplete, setProfileComplete] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/student-profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.profile) {
          const profile = response.data.profile;

          setFormData({
            matric_number: profile.matric_number || "",
            department: profile.department || "",
            faculty: profile.faculty || "",
            level: profile.level || "",
            school_email: profile.school_email || "",
            organization_name: profile.organization_name || "",
            organization_address: profile.organization_address || "",
            industry_supervisor_name: profile.industry_supervisor_name || "",
            industry_supervisor_email: profile.industry_supervisor_email || "",
            industry_supervisor_phone: profile.industry_supervisor_phone || "",
            training_start_date: profile.training_start_date || "",
            training_end_date: profile.training_end_date || "",
          });

          setPassportPreview(profile.passport_url || "");
          setProfileComplete(!!response.data.is_complete);
        }
      } catch {
        setError("Could not load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePassportChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPassport(file);
    setPassportPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value ?? "");
      });

      if (passport) {
        payload.append("passport", passport);
      }

      const response = await api.post("/student-profile", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(response.data.message || "Profile saved successfully.");
      setProfileComplete(!!response.data.is_complete);
      await refreshUser();
    } catch (err) {
      if (err?.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        setError(firstError || "Failed to save profile.");
      } else {
        setError(err?.response?.data?.message || "Failed to save profile.");
      }
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
        Loading profile...
      </div>
    );
  }

  return (
    <AppLayout title="Profile" subtitle="Complete Your SIWES Profile">
      {!profileComplete && (
        <div className="mb-4 rounded-xl px-4 py-3 bg-yellow-500/20 text-yellow-300 text-sm">
          Please complete the required fields before accessing the full dashboard.
        </div>
      )}

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

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          name="matric_number"
          placeholder="Matric Number"
          value={formData.matric_number}
          onChange={handleChange}
          className="rounded-xl px-4 py-3 outline-none"
          style={{
            backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
            color: isDark ? "#fff" : "#08060d",
          }}
          required
        />

        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          className="rounded-xl px-4 py-3 outline-none"
          style={{
            backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
            color: isDark ? "#fff" : "#08060d",
          }}
          required
        />

        <input
          type="text"
          name="faculty"
          placeholder="Faculty"
          value={formData.faculty}
          onChange={handleChange}
          className="rounded-xl px-4 py-3 outline-none"
          style={{
            backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
            color: isDark ? "#fff" : "#08060d",
          }}
          required
        />

        <input
          type="text"
          name="level"
          placeholder="Level"
          value={formData.level}
          onChange={handleChange}
          className="rounded-xl px-4 py-3 outline-none"
          style={{
            backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
            color: isDark ? "#fff" : "#08060d",
          }}
          required
        />

        <input
          type="email"
          name="school_email"
          placeholder="School Email"
          value={formData.school_email}
          onChange={handleChange}
          className="rounded-xl px-4 py-3 outline-none"
          style={{
            backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
            color: isDark ? "#fff" : "#08060d",
          }}
          required
        />

        <div
          className="rounded-xl px-4 py-3"
          style={{
            backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
          }}
        >
          <label className="block text-sm mb-2 opacity-80">Passport Upload</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handlePassportChange}
            className="w-full text-sm"
          />
        </div>

        {passportPreview && (
          <div className="md:col-span-2">
            <img
              src={passportPreview}
              alt="Passport Preview"
              className="w-28 h-28 object-cover rounded-2xl border"
              style={{ borderColor: isDark ? "#2a203a" : "#ddd" }}
            />
          </div>
        )}

        <input
          type="text"
          name="organization_name"
          placeholder="SIWES Organization Name"
          value={formData.organization_name}
          onChange={handleChange}
          className="rounded-xl px-4 py-3 outline-none"
          style={{
            backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
            color: isDark ? "#fff" : "#08060d",
          }}
        />

        <input
          type="text"
          name="organization_address"
          placeholder="Organization Address"
          value={formData.organization_address}
          onChange={handleChange}
          className="rounded-xl px-4 py-3 outline-none"
          style={{
            backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
            color: isDark ? "#fff" : "#08060d",
          }}
        />

        <input
          type="text"
          name="industry_supervisor_name"
          placeholder="Industry Supervisor Name"
          value={formData.industry_supervisor_name}
          onChange={handleChange}
          className="rounded-xl px-4 py-3 outline-none"
          style={{
            backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
            color: isDark ? "#fff" : "#08060d",
          }}
        />

        <input
          type="email"
          name="industry_supervisor_email"
          placeholder="Industry Supervisor Email"
          value={formData.industry_supervisor_email}
          onChange={handleChange}
          className="rounded-xl px-4 py-3 outline-none"
          style={{
            backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
            color: isDark ? "#fff" : "#08060d",
          }}
        />

        <input
          type="text"
          name="industry_supervisor_phone"
          placeholder="Industry Supervisor Phone"
          value={formData.industry_supervisor_phone}
          onChange={handleChange}
          className="rounded-xl px-4 py-3 outline-none"
          style={{
            backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
            color: isDark ? "#fff" : "#08060d",
          }}
        />

        <input
          type="date"
          name="training_start_date"
          value={formData.training_start_date}
          onChange={handleChange}
          className="rounded-xl px-4 py-3 outline-none"
          style={{
            backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
            color: isDark ? "#fff" : "#08060d",
          }}
        />

        <input
          type="date"
          name="training_end_date"
          value={formData.training_end_date}
          onChange={handleChange}
          className="rounded-xl px-4 py-3 outline-none"
          style={{
            backgroundColor: isDark ? "#1a1426" : "#f7f7f7",
            color: isDark ? "#fff" : "#08060d",
          }}
        />

        <div className="md:col-span-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl px-6 py-3 font-semibold"
            style={{
              backgroundColor: "#aa3bff",
              color: "#fff",
            }}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}

export default ProfilePage;