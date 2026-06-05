import React, { useState } from "react";
import HeroContent from "./HeroContent";

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const bannerData = [
    {
      id: 1,
      bgImage:
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1600&h=900&q=80",
      topHeading: "PREMIUM AUDIO",
      midHeading: "Immerse In Ultimate Sound",
      offerText: "On All Premium Headphones",
      description: "Save more with exclusive bank coupons & up to 70% off!",
    },
    {
      id: 2,
      bgImage:
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1600&h=900&q=80",
      topHeading: "FLAGSHIP MOBILES",
      midHeading: "Next-Gen Performance & Display",
      offerText: "Latest Smartphones Launch",
      description: "Get no-cost EMI options and exchange bonuses up to ₹5,000.",
    },
    {
      id: 3,
      bgImage:
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1600&h=900&q=80",
      topHeading: "BLUETOOTH SPEAKERS",
      midHeading: "Explosive Bass Anywhere",
      offerText: "Grab the Party Starters",
      description: "Waterproof, durable, and packed with extra deep bass.",
    },
    {
      id: 4,
      bgImage:
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1600&h=900&q=80",
      topHeading: "GAMING ACCESSORIES",
      midHeading: "Gear Up For Ultimate Victory",
      offerText: "Pro-Gaming Tech & Setup",
      description:
        "Ultra-low latency mechanical keyboards and RGB mice available.",
    },
  ];

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? bannerData.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === bannerData.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full relative overflow-hidden h-[450px] md:h-[500px] mt-2 group">
      <div
        className="flex w-full h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {bannerData.map((elem) => (
          <HeroContent
            key={elem.id}
            bgImage={elem.bgImage}
            topHeading={elem.topHeading}
            midHeading={elem.midHeading}
            offerText={elem.offerText}
            description={elem.description}
          />
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <svg
        className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 12L10 5V9H20.2C20.48 9 20.62 9 20.727 9.0545C20.8211 9.10243 20.8976 9.17892 20.9455 9.273C21 9.37996 21 9.51997 21 9.8V14.2C21 14.48 21 14.62 20.9455 14.727C20.8976 14.8211 20.8211 14.8976 20.727 14.9455C20.62 15 20.48 15 20.2 15H10V19L3 12Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <svg
        className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 12L14 5V9H3.8C3.51997 9 3.37996 9 3.273 9.0545C3.17892 9.10243 3.10243 9.17892 3.0545 9.273C3 9.37996 3 9.51997 3 9.8V14.2C3 14.48 3 14.62 3.0545 14.727C3.10243 14.8211 3.17892 14.8976 3.273 14.9455C3.37996 15 3.51997 15 3.8 15H14V19L21 12Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default Hero;
