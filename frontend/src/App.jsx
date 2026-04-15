import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProfileCompletionRoute from "./routes/ProfileCompletionRoute";
import LogbookPage from "./pages/LogbookPage";

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
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProfileCompletionRoute>
              <DashboardPage />
            </ProfileCompletionRoute>
          }
        />

        <Route
  path="/logbook"
  element={
    <ProfileCompletionRoute>
      <LogbookPage />
    </ProfileCompletionRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;