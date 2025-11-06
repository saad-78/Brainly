import { Signin } from "./pages/Signin"
import { Signup } from "./pages/Signup"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Dashboard } from "../src/pages/Dashboard"
import { SharePage } from "./pages/SharePage";
import { AiChat } from "./pages/AiChat";
import { NotesPage } from "./pages/NotesPage";
function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/share/:shareHash" element={<SharePage />} />
      <Route path="/notes" element={<NotesPage />} />
      <Route path="/ai" element={<AiChat />} />
    </Routes>
  </BrowserRouter>
}

export default App