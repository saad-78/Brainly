import { Signin } from "./pages/Signin"
import { Signup } from "./pages/Signup"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Dashboard } from "../src/pages/Dashboard"
import { SharePage } from "./pages/SharePage";
import { NotesPage } from "./pages/NotesPage";
function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/share/:shareHash" element={<SharePage />} />
      <Route path="/notes" element={<NotesPage />} />
    </Routes>
  </BrowserRouter>
}

export default App