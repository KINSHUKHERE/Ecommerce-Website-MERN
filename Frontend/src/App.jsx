import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";
import DynamicTitle from "./components/DynamicTitle";

// Keep Render free-tier backend warm — ping every 14 min to avoid cold starts
const BACKEND_URL = import.meta.env.VITE_API_URL;

function App() {
  useEffect(() => {
    if (!BACKEND_URL) return; // Only run in production
    const ping = () => {
      fetch(`${BACKEND_URL}/get-categories`, { method: "GET" }).catch(() => {});
    };
    ping(); // Ping immediately on load
    const interval = setInterval(ping, 14 * 60 * 1000); // Every 14 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen">
      <ScrollToTop />
      <DynamicTitle />
      <AppRoutes />
    </div>
  );
}

export default App;
