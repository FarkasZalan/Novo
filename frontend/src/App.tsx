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
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { PublicRoute } from "./components/routes/PublicRoute";
import { ProfileSettings } from "./components/pages/user/ProfileSettings";
import { Footer } from "./components/layouts/Footer";
import Projects from "./components/pages/project/Projects";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <ScrollToTop />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth-related public routes (only accessible when not logged in) */}
            <Route element={<PublicRoute />}>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected routes (only accessible when logged in) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile-settings" element={<ProfileSettings />} />
              <Route path="/projects" element={<Projects />} />
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