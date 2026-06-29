import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === bannerData.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? bannerData.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === bannerData.length - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      // Swiped left -> next slide
      nextSlide();
    } else if (diff < -50) {
      // Swiped right -> prev slide
      prevSlide();
    }
    // Reset values
    setTouchStartX(0);
    setTouchEndX(0);
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="w-full relative overflow-hidden h-[220px] sm:h-[300px] md:h-[400px] mt-2 group touch-pan-y"
    >
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

      {/* Slider Indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-25">
        {bannerData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === index
                ? "w-7 h-1.5 bg-[#088178] shadow-xs"
                : "w-1.5 h-1.5 bg-white/60 hover:bg-white"
            }`}
            title={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-[#088178] text-slate-700 hover:text-white rounded-full z-20 opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-md transition-all duration-300 active:scale-90 cursor-pointer"
        title="Previous slide"
      >
        <ChevronLeft size={20} className="stroke-[2.5]" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-[#088178] text-slate-700 hover:text-white rounded-full z-20 opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-md transition-all duration-300 active:scale-90 cursor-pointer"
        title="Next slide"
      >
        <ChevronRight size={20} className="stroke-[2.5]" />
      </button>
    </div>
  );
};

export default Hero;
