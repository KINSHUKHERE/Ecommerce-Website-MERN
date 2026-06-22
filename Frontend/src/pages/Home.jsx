import React from "react";
import Hero from "../components/Hero";
import FeaturedProduct from "../components/FeaturedProduct";
import AdvertisementBanner from "../components/AdvertisementBanner";
import Footer from "../components/Footer";

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

export default Home;
