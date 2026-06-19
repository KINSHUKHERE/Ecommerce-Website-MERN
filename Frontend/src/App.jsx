import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop"

function App() {
  return (
    <div className="w-full h-screen">
      <ScrollToTop />
      <AppRoutes />
    </div>
  );
}

export default App;
