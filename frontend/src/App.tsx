import { Route, Routes } from "react-router-dom"
import { Navbar } from "./components/layouts/Navbar"
import { Home } from "./components/pages/Home"
import { Profile } from "./components/pages/Profile"
import { Contact } from "./components/pages/Contact"
import { Register } from "./components/pages/Register"
import { Login } from "./components/pages/Login"
import { PrivacyPolicy } from "./components/pages/Privacy"
import { TermsOfService } from "./components/pages/TermsOfService"
import { About } from "./components/pages/About"
import { ScrollToTop } from "./components/utils/ScrollToTop"


function App() {

  return (
    <div >
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  )
}

export default App
