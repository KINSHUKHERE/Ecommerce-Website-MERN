import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";
import DynamicTitle from "./components/DynamicTitle";

function App() {
  return (
    <div className="w-full h-screen">
      <ScrollToTop />
      <DynamicTitle />
      <AppRoutes />
    </div>
  );
}

export default App;
