import { Outlet } from "react-router-dom";
import SiteHeader from "./SiteHeader.jsx";

export default function AppShell() {
  return  <div className="app-shell">
            <SiteHeader />
             <main>
                <Outlet />
              </main>;
          </div>
}