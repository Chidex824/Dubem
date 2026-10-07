import { Outlet } from "react-router-dom";
import SiteHeader from "./SiteHeader.jsx";

export default function AppShell() {
  return (<><SiteHeader /><main><Outlet /></main></>);
}