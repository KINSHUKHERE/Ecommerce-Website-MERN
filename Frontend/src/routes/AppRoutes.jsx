import { Routes, Route } from "react-router-dom";
import Hero from "../components/Hero";
import FeaturedProduct from "../components/FeaturedProduct";
import AdvertisementBanner from "../components/AdvertisementBanner";
import Footer from "../components/Footer";
import ProductDetails from "../components/ProductDetails";
import About from "../components/About";
import Contact from "../components/Contact";
import { useEffect } from "react";
import CreateProduct from "../components/CreateProduct";
import AddToCart from "../components/AddToCart";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ContactDetails from "../pages/admin/ContactDetails";
import OrderDetails from "../pages/admin/OrderDetails";
import LogIn from "../pages/Login";
import SignUp from "../pages/SignUp";

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
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/products" element={<FeaturedProduct />} />
      <Route path="/create-product" element={<CreateProduct />} />
      <Route path="/products/:productId" element={<ProductDetails />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/cart" element={<AddToCart />} />
      <Route path="/contact-details" element={<ContactDetails />} />
      <Route path="/order-details" element={<OrderDetails />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/register" element={<SignUp />} />
    </Routes>
  );
};

export default AppRoutes;
