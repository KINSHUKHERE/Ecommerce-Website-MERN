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
  Headset,
  ArrowRight
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

  const maxVisible = 14;
  const hasMore = categories.length > maxVisible;
  const displayedCategories = hasMore ? categories.slice(0, maxVisible) : categories;

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

        {/* Sliding horizontal list on all screen sizes with uniform widths */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-6 gap-4 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-6 px-6 sm:-mx-12 sm:px-12 lg:-mx-16 lg:px-16">
            {displayedCategories.map((cat) => (
              <div
                key={cat._id}
                onClick={() => navigate(`/products?category=${cat._id}`)}
                className="flex-shrink-0 w-[110px] sm:w-[130px] group flex flex-col items-center justify-center p-4 bg-white border border-light-border/60 rounded-2xl sm:rounded-3xl hover:border-primary/25 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_16px_35px_rgba(15,157,138,0.04)] hover:-translate-y-1 transition-all duration-300 cursor-pointer snap-start"
              >
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-soft-bg text-dark-navy group-hover:bg-accent-light group-hover:text-primary flex items-center justify-center transition-all duration-300 shadow-sm border border-light-border/10 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6 flex-shrink-0">
                  {getCategoryIcon(cat.name)}
                </div>
                <span className="text-[11px] sm:text-xs font-black text-dark-navy mt-3 group-hover:text-primary transition-colors line-clamp-1 text-center w-full px-1">
                  {cat.name}
                </span>
              </div>
            ))}

            {/* Always show "Show All" or only if hasMore is true? The user says: "sliding with only 10 or 15 then show all option shoud be there" which implies when we have more than the limit we show the "Show All" card */}
            {hasMore && (
              <div
                onClick={() => navigate("/products")}
                className="flex-shrink-0 w-[110px] sm:w-[130px] group flex flex-col items-center justify-center p-4 bg-white border border-light-border/60 rounded-2xl sm:rounded-3xl hover:border-primary/25 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_16px_35px_rgba(15,157,138,0.04)] hover:-translate-y-1 transition-all duration-300 cursor-pointer snap-start"
              >
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm border border-primary/10 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6 flex-shrink-0">
                  <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
                <span className="text-[11px] sm:text-xs font-black text-primary mt-3 group-hover:text-accent transition-colors line-clamp-1 text-center w-full px-1">
                  Show All
                </span>
              </div>
            )}
          </div>
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
