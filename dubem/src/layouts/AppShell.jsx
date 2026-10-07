import { Outlet } from "react-router-dom";
import SiteHeader from "./SiteHeader.jsx";
import Footer from "./Footer.jsx";

export default function AppShell() {
  return (
    <div className="shell">
      <SiteHeader />
      <main><Outlet /></main>
      <Footer />
    </div>
  );
}