import { Route, Routes, Navigate } from "react-router-dom";
import { Navbar } from "./components/layouts/Navbar";
import { Home } from "./components/pages/Home";
import { Profile } from "./components/pages/user/Profile";
import { Contact } from "./components/pages/Contact";
import { Register } from "./components/pages/auth/Register";
import { Login } from "./components/pages/auth/Login";
import { PrivacyPolicy } from "./components/pages/Privacy";
import { TermsOfService } from "./components/pages/TermsOfService";
import { About } from "./components/pages/About";
import { ScrollToTop } from "./components/utils/ScrollToTop";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { PublicRoute } from "./components/routes/PublicRoute";
import { ProfileSettings } from "./components/pages/user/ProfileSettings";
import { Footer } from "./components/layouts/Footer";
import { OAuthCallback } from "./components/pages/auth/OAuthCallback";
import { ForgotPassword } from "./components/pages/auth/ForgotPassword";
import { ResetPassword } from "./components/pages/auth/ResetPassword";
import { VerifyEmail } from "./components/pages/auth/VerifyEmail";
import { Dashboard } from "./components/pages/project/Dashboard";
import { CreateProject } from "./components/pages/project/ProjectHandle/CreateProject";
import { EditProject } from "./components/pages/project/ProjectHandle/EditProject";
import { ProjectPage } from "./components/pages/project/projectPage/ProjectPage";
import { ProtectedProjectForOwner } from "./components/routes/ProjectOwnerRoute";
import { FilesTab } from "./components/pages/project/projectPage/ProjectTabs/FilesTab";
import { CreateTaskPage } from "./components/pages/task/taskHandler/CreateTaskPage";
import { TasksManagerPage } from "./components/pages/task/TaskManaggerPage";
import { UpdateTaskPage } from "./components/pages/task/taskHandler/UpdateTaskPage";
import { TaskDetails } from "./components/pages/task/taskComponents/taskDetails/TaskDetails";
import { ProtectedProjectForTaskManagement } from "./components/routes/TaskAdminOrOwnerRoute";
import { useAuth } from "./hooks/useAuth";
import { AuthProvider } from "./context/AuthProvider";
import { MilestoneDetailsPage } from "./components/pages/task/taskComponents/milestones/milestoneDetails/MilestoneDetails";
import { TaskEditReadOnlyRoute } from "./components/routes/TaskEditForReadOnlyRoute";
import { AllFilteredLogsComponent } from "./components/pages/project/AllLog";
import { useEffect, useState } from "react";
import { BotCheck } from "./components/BotCheck";

function RootRedirect() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/home" replace />;
  }
}

function App() {
  const [passedBotCheck, setPassedBotCheck] = useState(false);
  const [shouldAskBotCheck, setShouldAskBotCheck] = useState(false);
  const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

  useEffect(() => {
    const flag = localStorage.getItem("passedBotCheck");
    if (flag === "true") {
      setPassedBotCheck(true);
      setShouldAskBotCheck(false);
    } else {
      setShouldAskBotCheck(true);
    }
  }, []);

  const handleBotVerified = () => {
    localStorage.setItem("passedBotCheck", "true");
    setPassedBotCheck(true);
    setShouldAskBotCheck(false);
  };

  // If user hasn’t passed the CAPTCHA yet, show the overlay and exit early
  if (!passedBotCheck && shouldAskBotCheck) {
    return (
      <BotCheck
        siteKey={SITE_KEY}
        onVerified={handleBotVerified}
      />
    );
  }

  // Once the CAPTCHA is passed, render the rest of the app
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <ScrollToTop />
        <Navbar />
        <main className="flex-grow bg-transparent">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth-related public routes (only when NOT logged in) */}
            <Route element={<PublicRoute />}>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
            </Route>

            {/* Protected routes (only when logged in) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile-settings" element={<ProfileSettings />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/new" element={<CreateProject />} />
              <Route path="/projects/:projectId" element={<ProjectPage />} />
              <Route path="/projects/:projectId/files" element={<FilesTab />} />
              <Route
                path="/projects/:projectId/milestones/:milestoneId"
                element={<MilestoneDetailsPage />}
              />
              <Route
                path="/projects/:projectId/tasks"
                element={<TasksManagerPage />}
              />
              <Route
                path="/projects/:projectId/tasks/:taskId"
                element={<TaskDetails />}
              />
              <Route path="/all-log" element={<AllFilteredLogsComponent />} />
            </Route>

            <Route element={<ProtectedProjectForOwner />}>
              <Route path="/projects/:projectId/edit" element={<EditProject />} />
            </Route>

            <Route element={<ProtectedProjectForTaskManagement />}>
              <Route
                path="/projects/:projectId/tasks/new"
                element={<CreateTaskPage />}
              />
            </Route>

            <Route element={<TaskEditReadOnlyRoute />}>
              <Route
                path="/projects/:projectId/tasks/:taskId/edit"
                element={<UpdateTaskPage />}
              />
            </Route>

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;