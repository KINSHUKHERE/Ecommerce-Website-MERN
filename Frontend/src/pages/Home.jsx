import React from "react";
import Hero from "../components/Hero";
import FeaturedProduct from "../components/FeaturedProduct";
import { CategoryGrid, TrustBadges } from "../components/HomeFeatures";
import AdvertisementBanner from "../components/AdvertisementBanner";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedProduct k={4} />
      <AdvertisementBanner />
      <TrustBadges />
      <Footer />
    </>
  );
};

export default Home;
