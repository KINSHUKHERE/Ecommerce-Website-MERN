import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Smartphone, 
  Laptop, 
  Headphones, 
  Watch, 
  Keyboard, 
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headset
} from "lucide-react";
import { getCategories } from "../api/CategoryAndBrandApi";

// Category Grid Component
export const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data?.categories || []);
      } catch (err) {
        console.error("Error fetching homepage categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  const getCategoryIcon = (name) => {
    const cleanName = (name || "").toLowerCase();
    if (cleanName.includes("phone") || cleanName.includes("mobile")) return <Smartphone size={22} />;
    if (cleanName.includes("laptop") || cleanName.includes("computer")) return <Laptop size={22} />;
    if (cleanName.includes("audio") || cleanName.includes("headphone") || cleanName.includes("speaker")) return <Headphones size={22} />;
    if (cleanName.includes("watch")) return <Watch size={22} />;
    if (cleanName.includes("keyboard") || cleanName.includes("mouse")) return <Keyboard size={22} />;
    return <ShoppingBag size={22} />;
  };

  if (loading || categories.length === 0) return null;

  return (
    <div className="w-full bg-soft-bg/40 py-16 border-b border-light-border/60">
      <div className="w-full px-6 sm:px-12 lg:px-16">
        <div className="text-center mb-10 flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-navy tracking-tight relative pb-3.5 w-fit">
            Shop by Category
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"></span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-gray font-medium mt-3.5">
            Find the perfect gear for your setup
          </p>
        </div>

        {/* Swipeable horizontal list on mobile, grid layout on desktop */}
        <div className="flex overflow-x-auto pb-4 gap-3 md:grid md:grid-cols-4 lg:grid-cols-6 md:gap-6 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-6 px-6 sm:-mx-12 sm:px-12 lg:-mx-16 lg:px-16">
          {categories.map((cat) => (
            <div
              key={cat._id}
              onClick={() => navigate(`/products?category=${cat._id}`)}
              className="flex-shrink-0 w-[95px] sm:w-auto group flex flex-col items-center justify-center p-3.5 sm:p-5 bg-white border border-light-border/60 rounded-2xl sm:rounded-3xl hover:border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_16px_35px_rgba(15,157,138,0.04)] hover:-translate-y-1 transition-all duration-300 cursor-pointer snap-start"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-soft-bg text-dark-navy group-hover:bg-accent-light group-hover:text-primary flex items-center justify-center transition-all duration-300 shadow-sm border border-light-border/10 [&>svg]:w-4.5 [&>svg]:h-4.5 sm:[&>svg]:w-5.5 sm:[&>svg]:h-5.5">
                {getCategoryIcon(cat.name)}
              </div>
              <span className="text-[10px] sm:text-sm font-bold text-dark-navy mt-2.5 group-hover:text-primary transition-colors line-clamp-1 text-center w-full">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Trust Badges Component
export const TrustBadges = () => {
  const badges = [
    {
      icon: <Truck size={22} />,
      title: "Free Delivery",
      desc: "On orders above ₹1,000"
    },
    {
      icon: <ShieldCheck size={22} />,
      title: "Secure Payment",
      desc: "100% SSL protected transactions"
    },
    {
      icon: <RotateCcw size={22} />,
      title: "Easy Returns",
      desc: "7-day hassle-free replacement"
    },
    {
      icon: <Headset size={22} />,
      title: "Dedicated Support",
      desc: "24/7 email & ticketing care"
    }
  ];

  return (
    <div className="w-full bg-white py-16 border-t border-light-border/50">
      <div className="w-full px-6 sm:px-12 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4.5 p-5 bg-soft-bg border border-light-border/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.005)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.015)] transition-all duration-300 text-left"
            >
              <div className="w-12 h-12 bg-accent-light text-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs border border-primary/5">
                {badge.icon}
              </div>
              <div>
                <h4 className="font-bold text-dark-navy text-sm sm:text-base leading-tight">
                  {badge.title}
                </h4>
                <p className="text-xs text-muted-gray font-medium mt-1 leading-normal">
                  {badge.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
