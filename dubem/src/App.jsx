import { Routes, Route } from "react-router-dom";
import AppShell from "./layouts/AppShell.jsx";
import Home from "./pages/Home.jsx";
import Opportunities from "./pages/Opportunities.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import ForOrgs from "./pages/ForOrgs.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Account from "./pages/Account.jsx";
import Post from "./pages/Post.jsx";
import Admin from "./pages/Admin.jsx";
import RequiredRole from "./auth/RequiredRole.jsx";
// import the other pages the same way

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/jobs" element={<Opportunities type="job" title="Jobs" />} />
        <Route path="/internships" element={<Opportunities type="internship" title="Internships" />} />
        <Route path="/fellowships" element={<Opportunities type="fellowship" title="Fellowships" />} />
        <Route path="/jobs/:slug" element={<JobDetail />} />
        <Route path="/for-organizations" element={<ForOrgs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account" element={<Account />} />
        <Route path="/post" element={<Post />} />
        <Route path="/account" element={<RequiredRole roles={["seeker"]}><Account /></RequiredRole>} />
        <Route path="/post"    element={<RequiredRole roles={["org", "admin"]}><Post /></RequiredRole>} />
        <Route path="/admin"   element={<RequiredRole roles={["admin"]}><Admin /></RequiredRole>} />  
      </Route>
    </Routes>
  );
}