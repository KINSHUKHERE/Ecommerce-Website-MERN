import React from "react";
import { useNavigate } from "react-router-dom";
import { sentToCart } from "../api/CartApi";
import { toggleWishlist } from "../api/WishlistApi";
import { Heart, ShoppingCart, Loader2 } from "lucide-react";

const getRatingColorClass = (rating) => {
  const r = Math.round(Number(rating));
  if (r >= 4) return "text-emerald-500";
  if (r === 3) return "text-amber-500";
  return "text-rose-500";
};

const EachProduct = ({ data }) => {
  const navigate = useNavigate();
  const [adding, setAdding] = React.useState(false);
  const [toast, setToast] = React.useState("");

  if (!data) return null;

  const user = JSON.parse(localStorage.getItem("user"));
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  React.useEffect(() => {
    const checkWishlist = () => {
      const cached = localStorage.getItem("yocart_wishlist_ids");
      if (cached) {
        setIsWishlisted(JSON.parse(cached).includes(data._id));
      }
    };
    checkWishlist();

    window.addEventListener("wishlistUpdated", checkWishlist);
    return () => {
      window.removeEventListener("wishlistUpdated", checkWishlist);
    };
  }, [data._id]);

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    try {
      if (!user) {
        navigate("/login");
        return;
      }

      const res = await toggleWishlist(data._id);
      const newIds = res.data.wishlistIds || [];
      localStorage.setItem("yocart_wishlist_ids", JSON.stringify(newIds));
      setIsWishlisted(res.data.isWishlisted);
      window.dispatchEvent(new Event("wishlistUpdated"));

      setToast(
        res.data.isWishlisted
          ? `"${data.heading}" added to wishlist! ❤️`
          : `"${data.heading}" removed from wishlist.`
      );
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      console.log("Error toggling wishlist", err);
      setToast("Failed to update wishlist");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const [globalSaleActive, setGlobalSaleActive] = React.useState(() => {
    try {
      const cached = sessionStorage.getItem("globalSaleConfig");
      return cached ? JSON.parse(cached).isGlobalSaleActive : false;
    } catch {
      return false;
    }
  });

  const [saleTheme, setSaleTheme] = React.useState(() => {
    try {
      const cached = sessionStorage.getItem("globalSaleConfig");
      return cached ? JSON.parse(cached).saleTheme || "normal" : "normal";
    } catch {
      return "normal";
    }
  });

  React.useEffect(() => {
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

  const getStockCount = (product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    }
    return product.quantity ?? 0;
  };

  const getProductPricing = (product) => {
    if (product.variants && product.variants.length > 0) {
      const variantPrices = product.variants.map(v => {
        const isVOnSale = globalSaleActive && v.onSale && v.salePrice > 0;
        const currentPrice = isVOnSale ? v.salePrice : v.price;
        return {
          currentPrice,
          originalPrice: v.price,
          isOnSale: isVOnSale
        };
      });

      variantPrices.sort((a, b) => a.currentPrice - b.currentPrice);
      return variantPrices[0] || { currentPrice: 0, originalPrice: 0, isOnSale: false };
    }

    const isProdOnSale = globalSaleActive && product.onSale && product.salePrice > 0;
    return {
      currentPrice: isProdOnSale ? product.salePrice : (product.price || 0),
      originalPrice: product.price || 0,
      isOnSale: isProdOnSale
    };
  };

  const stockCount = getStockCount(data);
  const isOutOfStock = stockCount <= 0 || data.sold;

  const productClicked = () => {
    navigate(`/products/${data._id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (data.options && data.options.length > 0) {
      navigate(`/products/${data._id}`);
      return;
    }

    try {
      if (!user) {
        navigate("/login");
        return;
      }

      setAdding(true);
      
      const cartData = {
        userId: user._id,
        productId: data._id,
        quantity: 1,
      };

      await sentToCart(cartData);
      window.dispatchEvent(new Event("cartUpdated"));
      
      setToast(`"${data.heading}" added to cart!`);
      setTimeout(() => {
        setToast("");
      }, 2500);
    } catch (err) {
      const errMsg = err.response?.data?.msg || "Unable to add product to cart";
      setToast(errMsg);
      setTimeout(() => {
        setToast("");
      }, 3000);
      console.log("Unable to add product to cart", err);
    } finally {
      setAdding(false);
    }
  };

  const getCardThemeClasses = () => {
    if (!globalSaleActive) return "border-light-border/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.04)] hover:border-light-border";
    switch (saleTheme) {
      case "diwali":
        return "border-amber-200/50 bg-amber-50/15 shadow-[0_8px_25px_rgba(217,119,6,0.08)] hover:shadow-[0_12px_30px_rgba(217,119,6,0.15)] hover:border-amber-400";
      case "summer":
        return "border-orange-100 bg-amber-50/5 shadow-[0_8px_25px_rgba(251,146,60,0.05)] hover:shadow-[0_12px_30px_rgba(251,146,60,0.1)] hover:border-orange-350";
      case "winter":
        return "border-blue-100 bg-white/40 backdrop-blur-xs shadow-[0_8px_25px_rgba(59,130,246,0.05)] hover:shadow-[0_12px_30px_rgba(59,130,246,0.1)] hover:border-blue-300";
      case "holi":
        return "border-pink-100 bg-white/50 shadow-[0_8px_25px_rgba(236,72,153,0.05)] hover:shadow-[0_12px_30px_rgba(236,72,153,0.1)] hover:border-pink-300";
      case "christmas":
        return "border-red-100 bg-red-50/5 shadow-[0_8px_25px_rgba(220,38,38,0.05)] hover:shadow-[0_12px_30px_rgba(220,38,38,0.1)] hover:border-red-300";
      case "yocart":
        return "border-violet-100 bg-white/80 shadow-[0_8px_25px_rgba(124,58,237,0.06)] hover:shadow-[0_12px_30px_rgba(124,58,237,0.12)] hover:border-violet-300";
      default:
        return "border-light-border/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.04)] hover:border-light-border";
    }
  };

  return (
    <div
      className={`w-full max-w-sm mx-auto p-3 border rounded-3xl transition-all duration-300 group cursor-pointer flex flex-col justify-between h-full relative overflow-hidden ${getCardThemeClasses()}`}
      onClick={productClicked}
    >
      <div>
        <div className={`w-full h-36 sm:h-48 bg-soft-bg/80 rounded-2xl p-4 flex justify-center items-center overflow-hidden relative border border-light-border/30 ${isOutOfStock ? "grayscale" : ""}`}>
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2 rounded-full bg-white hover:bg-white text-muted-gray hover:text-red-500 transition-all duration-300 z-10 shadow-xs border border-light-border/40 outline-none focus:outline-none cursor-pointer"
          >
            <Heart
              size={15}
              className={`transition-colors duration-300 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-muted-gray"
              }`}
            />
          </button>
          
          <img
            src={data.imgUrl}
            alt={data.heading}
            className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          
          {isOutOfStock && (
            <div className="absolute inset-0 bg-dark-navy/40 flex justify-center items-center rounded-2xl">
              <span className="bg-red-600 text-white font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                SOLD OUT
              </span>
            </div>
          )}
          {data.rating?.count > 0 && (
            <div className={`absolute bottom-2 right-2 bg-white/85 backdrop-blur-xs border border-light-border/30 px-2 py-0.5 rounded-lg flex items-center gap-0.5 ${getRatingColorClass(data.rating.avgRating)} font-extrabold text-[9px] sm:text-[10px] shadow-2xs z-10 select-none`}>
              <span>★</span>
              <span className="text-dark-navy font-black">{data.rating.avgRating}</span>
              <span className="text-muted-gray font-semibold">({data.rating.count})</span>
            </div>
          )}
        </div>

        <div className="pt-3 px-1 pb-1 flex flex-col gap-1 text-left">
          <div className="flex items-center justify-between mt-1">
            <span className="text-[9px] sm:text-[10px] text-muted-gray uppercase tracking-widest font-extrabold">
              {data.categoryId?.name}
            </span>
            <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isOutOfStock 
                ? "bg-red-50 text-red-600 border-red-100" 
                : stockCount <= 3 
                  ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse" 
                  : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}>
              {isOutOfStock ? "Sold Out" : `${stockCount} Left`}
            </span>
          </div>

          <h5 className="font-extrabold text-dark-navy text-[13px] sm:text-[14px] leading-snug line-clamp-2 min-h-[34px] sm:min-h-[38px] mt-1.5">
            {data.heading}
          </h5>

          <span className="text-[10px] sm:text-[11px] text-muted-gray font-semibold block">
            {data.brandId?.name}
          </span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-light-border/40 px-1">
          {(() => {
            const pricing = getProductPricing(data);
            if (pricing.isOnSale) {
              const discountPercent = Math.round(((pricing.originalPrice - pricing.currentPrice) / pricing.originalPrice) * 100);
              return (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-extrabold text-sm sm:text-base text-red-600">
                    ₹{pricing.currentPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] sm:text-xs line-through text-muted-gray font-semibold">
                    ₹{pricing.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-black text-white bg-red-500 rounded-md px-1.5 py-0.5 uppercase tracking-wider animate-pulse">
                    {discountPercent}% OFF
                  </span>
                </div>
              );
            }
            return (
              <span className="font-extrabold text-sm sm:text-base text-dark-navy">
                ₹{pricing.currentPrice.toLocaleString()}
              </span>
            );
          })()}

          <button
            className={`w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full flex justify-center items-center transition-all duration-300 flex-shrink-0 ${
              isOutOfStock
                ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-light-border"
                : "bg-accent-light text-primary hover:bg-primary hover:text-white border border-primary/10 active:scale-90 cursor-pointer"
            }`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
          >
            {adding ? (
              <Loader2 size={13} className="animate-spin text-current" />
            ) : (
              <ShoppingCart size={13} />
            )}
          </button>
        </div>
      </div>
      
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 md:top-auto md:left-auto md:bottom-5 md:right-5 md:translate-x-0 z-50 bg-dark-navy border border-light-border/10 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn max-w-[90%] w-max">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0"></span>
          {toast}
        </div>
      )}
    </div>
  );
};

export default EachProduct;
