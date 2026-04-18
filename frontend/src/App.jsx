import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProfileCompletionRoute from "./routes/ProfileCompletionRoute";
import LogbookPage from "./pages/LogbookPage";
import RoleRoute from "./routes/RoleRoute";
import SupervisorDashboardPage from "./pages/SupervisorDashboardPage";
import SupervisorWeekReviewPage from "./pages/SupervisorWeekReviewPage";
import AdminPage from "./pages/AdminPage";
import StudentOnlyRoute from "./routes/StudentOnlyRoute";
import StudentOnlineSupervisionPage from "./pages/StudentOnlineSupervisionPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <StudentOnlyRoute>
                <ProfilePage />
              </StudentOnlyRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProfileCompletionRoute>
              <StudentOnlyRoute>
                <DashboardPage />
              </StudentOnlyRoute>
            </ProfileCompletionRoute>
          }
        />

        <Route
          path="/logbook"
          element={
            <ProfileCompletionRoute>
              <StudentOnlyRoute>
                <LogbookPage />
              </StudentOnlyRoute>
            </ProfileCompletionRoute>
          }
        />

        <Route
          path="/supervisor/dashboard"
          element={
            <RoleRoute role="supervisor">
              <SupervisorDashboardPage />
            </RoleRoute>
          }
        />

        <Route
          path="/supervisor/week/:weekId"
          element={
            <RoleRoute role="supervisor">
              <SupervisorWeekReviewPage />
            </RoleRoute>
          }
        />

        <Route
  path="/online-supervision"
  element={
    <ProfileCompletionRoute>
      <StudentOnlyRoute>
        <StudentOnlineSupervisionPage />
      </StudentOnlyRoute>
    </ProfileCompletionRoute>
  }
/>

        <Route
          path="/admin"
          element={
            <RoleRoute role="admin">
              <AdminPage />
            </RoleRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;