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
import { AuthProvider, useAuth } from "./context/AuthContext";
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
import { ProjectPage } from "./components/pages/project/ProjectPage";
import { ProtectedProjectForOwner } from "./components/routes/ProjectOwnerRoute";
import { FilesTab } from "./components/pages/project/ProjectTabs/FilesTab";
import { CreateTaskPage } from "./components/pages/task/taskHandler/CreateTaskPage";
import { TasksManagerPage } from "./components/pages/task/TaskManaggerPage";
import { UpdateTaskPage } from "./components/pages/task/taskHandler/UpdateTaskPage";
import { TaskDetails } from "./components/pages/task/taskComponents/TaskDetails";

function RootRedirect() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/home" replace />;
  }
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <ScrollToTop />
        <Navbar />
        <main className="flex-grow bg-transparent">
          <Routes>
            {/* Public routes */}

            {/* Root path that redirects based on auth status */}
            <Route path="/" element={<RootRedirect />} />

            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth-related public routes (only accessible when not logged in) */}
            <Route element={<PublicRoute />}>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
            </Route>

            {/* Protected routes (only accessible when logged in) */}
            <Route element={<ProtectedRoute />}>
              {/* OAuth callback route */}
              {/* need to move outside from publicRoutes, 
              becasue when the user authState is updatedt to authenticated, 
              the route is redirect to "/" because of the public route but in the protected route if the user is somehow not authenticated 
              the route is not redirect to "/login" else on success login/register the route is redirect to "/dashboard  */}
              <Route path="/oauth-callback" element={<OAuthCallback />} />

              {/* User routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile-settings" element={<ProfileSettings />} />

              {/* Project routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects/new" element={<CreateProject />} />
              <Route path="/projects/:projectId" element={<ProjectPage />} />
              <Route path="/projects/:projectId/files" element={<FilesTab />} />

              { /* Task routes */}
              <Route path="/projects/:projectId/tasks" element={<TasksManagerPage />} />
              <Route path="/projects/:projectId/tasks/new" element={<CreateTaskPage />} />
              <Route path="/projects/:projectId/tasks/:taskId/edit" element={<UpdateTaskPage />} />
              <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetails />} />
            </Route>

            <Route element={<ProtectedProjectForOwner />}>
              <Route path="/projects/:projectId/edit" element={<EditProject />} />
            </Route>

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {/* Footer */}
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;