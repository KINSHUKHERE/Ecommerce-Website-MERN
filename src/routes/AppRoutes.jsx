import { Routes, Route } from "react-router-dom";
import Hero from "../components/Hero";
import FeaturedProduct from "../components/FeaturedProduct";
import AdvertisementBanner from "../components/AdvertisementBanner";
import Footer from "../components/Footer";
import ProductDetails from "../components/ProductDetails";
import About from "../components/About";
import Contact from "../components/Contact";
import { useEffect } from "react";

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturedProduct k={4} />
      <AdvertisementBanner />
      <Footer />
    </>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<FeaturedProduct />} />
      <Route path="/products/:productId" element={<ProductDetails />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
};

export default AppRoutes;
