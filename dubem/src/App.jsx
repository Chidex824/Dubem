import { Routes, Route } from "react-router-dom";
import AppShell from "./layouts/AppShell.jsx";
import Home from "./pages/Home.jsx";
// import the other pages the same way

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/opportunities" element={<Home />} />
        <Route path="/jobs" element={<Home type="job" />} />
        <Route path="/internships" element={<Home type="internship" />} />
        <Route path="/fellowships" element={<Home type="fellowship" />} />
        <Route path="/jobs/:slug" element={<JobDetail />} />
        <Route path="/for-organizations" element={<ForOrgs />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account" element={<Account />} />
        <Route path="/post" element={<Post />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}