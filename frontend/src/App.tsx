import { Route, Routes } from "react-router-dom"
import { Navbar } from "./components/Navbar"
import { Home } from "./components/pages/Home"
import { Profile } from "./components/pages/Profile"
import { Contact } from "./components/pages/Contact"


function App() {

  return (
    <div >
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  )
}

export default App
