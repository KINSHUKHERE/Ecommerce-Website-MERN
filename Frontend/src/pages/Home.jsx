import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import FeaturedProduct from "../components/FeaturedProduct";
import { CategoryGrid, TrustBadges } from "../components/HomeFeatures";
import AdvertisementBanner from "../components/AdvertisementBanner";
import Footer from "../components/Footer";
import FloatingStickers from "../components/FloatingStickers";

const Home = () => {
  const [globalSaleActive, setGlobalSaleActive] = useState(() => {
    try {
      const cached = sessionStorage.getItem("globalSaleConfig");
      return cached ? JSON.parse(cached).isGlobalSaleActive : false;
    } catch {
      return false;
    }
  });

  const [saleTheme, setSaleTheme] = useState(() => {
    try {
      const cached = sessionStorage.getItem("globalSaleConfig");
      return cached ? JSON.parse(cached).saleTheme || "normal" : "normal";
    } catch {
      return "normal";
    }
  });

  useEffect(() => {
    const handleConfigEvent = () => {
      try {
        const cached = sessionStorage.getItem("globalSaleConfig");
        if (cached) {
          const config = JSON.parse(cached);
          setGlobalSaleActive(config.isGlobalSaleActive);
          setSaleTheme(config.saleTheme || "normal");
        }
      } catch {
        setGlobalSaleActive(false);
        setSaleTheme("normal");
      }
    };
    window.addEventListener("saleConfigUpdated", handleConfigEvent);
    return () => window.removeEventListener("saleConfigUpdated", handleConfigEvent);
  }, []);

  const getThemeBackgroundClass = (theme) => {
    if (!globalSaleActive) return "bg-transparent";
    switch (theme) {
      case "diwali":
        return "bg-gradient-to-b from-orange-100/70 via-amber-50 to-yellow-100/60";
      case "summer":
        return "bg-gradient-to-b from-sky-100/60 via-amber-50 to-orange-100/50";
      case "winter":
        return "bg-gradient-to-b from-blue-100/60 via-cyan-50 to-sky-100/50";
      case "holi":
        return "bg-gradient-to-b from-pink-100/60 via-purple-50 to-emerald-100/50";
      case "christmas":
        return "bg-gradient-to-b from-red-100/45 via-slate-50 to-emerald-100/40";
      case "yocart":
        return "bg-gradient-to-b from-violet-100/60 via-slate-50 to-indigo-100/50";
      default:
        return "bg-transparent";
    }
  };

  return (
    <div className={`w-full transition-all duration-700 relative ${getThemeBackgroundClass(saleTheme)}`}>
      {globalSaleActive && <FloatingStickers theme={saleTheme} />}
      <Hero />
      <CategoryGrid />
      <FeaturedProduct k={4} />
      <AdvertisementBanner />
      <TrustBadges />
      <Footer />
    </div>
  );
};

export default Home;
