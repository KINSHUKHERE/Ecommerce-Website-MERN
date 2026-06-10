import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop"

function App() {
  return (
    <div className="w-full h-screen">
      <ScrollToTop />
      <Navbar />
      <AppRoutes />
    </div>
  );
}

export default App;
