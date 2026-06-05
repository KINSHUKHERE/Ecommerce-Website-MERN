import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedProduct from "./components/FeaturedProduct";
import AdvertisementBanner from "./components/AdvertisementBanner";
import Footer from "./components/Footer";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="w-full h-screen">
      <Navbar />
      <Hero />
      <FeaturedProduct />
      <AdvertisementBanner />
      <Footer />
    </div>
  );
}

export default App;
