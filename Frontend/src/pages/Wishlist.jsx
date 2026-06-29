import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../api/WishlistApi";
import { sentToCart } from "../api/CartApi";
import {
  Heart,
  ShoppingCart,
  Loader2,
  X,
  ArrowRight,
  Check,
} from "lucide-react";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const fetchWishlistData = async () => {
    try {
      if (!user) {
        setWishlist([]);
        setLoading(false);
        return;
      }
      const response = await getWishlist();
      const items = response.data.wishlistData || [];
      setWishlist(items);

      // Sync local storage cache
      const ids = items.map((item) => item.productId?._id || item.productId).filter(Boolean);
      localStorage.setItem("yocart_wishlist_ids", JSON.stringify(ids));
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.log("Failed to fetch wishlist", err);
      showToast("Unable to load wishlist items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchWishlistData();
  }, []);

  const handleRemove = async (productId, e) => {
    e.stopPropagation();
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
      showToast("Item removed from wishlist");
      await fetchWishlistData();
    } catch (err) {
      console.log("Error removing from wishlist", err);
      showToast("Failed to remove item", "error");
    } finally {
      setRemovingId(null);
    }
  };

  const handleMoveToCart = async (item, e) => {
    e.stopPropagation();
    const product = item.productId;
    if (!product) return;

    if (product.options && product.options.length > 0) {
      navigate(`/products/${product._id}`);
      return;
    }

    setRemovingId(product._id);
    try {
      const variantId = item.variantId?._id || (product.variants && product.variants[0]?._id);
      if (!variantId) {
        showToast("Product has no available variants", "error");
        setRemovingId(null);
        return;
      }

      const cartData = {
        userId: user._id,
        productId: product._id,
        variantId: variantId,
        quantity: 1,
      };

      await sentToCart(cartData);
      window.dispatchEvent(new Event("cartUpdated"));

      await removeFromWishlist(product._id);
      showToast(`"${product.heading}" moved to cart! 🛒`);
      await fetchWishlistData();
    } catch (err) {
      const errMsg = err.response?.data?.msg || "Failed to add to cart";
      showToast(errMsg, "error");
      console.log("Error moving to cart", err);
    } finally {
      setRemovingId(null);
    }
  };

  const getMinPrice = (product) => {
    if (product.variants && product.variants.length > 0) {
      return Math.min(...product.variants.map((v) => v.price));
    }
    return product.price || 0;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 bg-soft-bg/30">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-xs font-semibold text-muted-gray animate-pulse">
          Opening your wishlist...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-dark-navy antialiased">
      
      {/* Toast Alert Widget */}
      {message && (
        <div className="fixed bottom-5 right-5 z-50 bg-dark-navy border border-light-border/10 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              toastType === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {toastType === "success" ? <Check size={12} /> : <X size={12} />}
          </div>
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-10 border-b border-light-border/60 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-navy tracking-tight flex items-center gap-2.5">
          My Wishlist
          {wishlist.length > 0 && (
            <span className="bg-rose-50 text-rose-600 border border-rose-100/50 text-xs font-extrabold px-3 py-0.5 rounded-full shadow-xs ml-2 select-none">
              {wishlist.length} Items
            </span>
          )}
        </h1>
        <p className="text-xs sm:text-sm text-muted-gray mt-2 font-medium">
          Manage your saved products and move them to your shopping cart.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white border border-light-border/60 rounded-3xl p-10 max-w-lg mx-auto shadow-2xs flex flex-col items-center">
          
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-rose-500/5 rounded-full scale-125 blur-md animate-pulse"></div>
            <div className="relative w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-xs border border-rose-100">
              <Heart size={30} className="fill-rose-500/10 stroke-[2.5]" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-dark-navy tracking-tight">
            Your Wishlist is Empty
          </h2>
          <p className="text-muted-gray text-xs sm:text-sm mt-3 max-w-xs mx-auto leading-relaxed font-semibold">
            Looks like you haven't added anything to your wishlist yet. Explore our catalog to find items you love!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 mt-8 px-8 py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 cursor-pointer group"
          >
            Start Shopping
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300 text-white/95" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map((item) => {
            const product = item.productId;
            if (!product) return null;

            const isOutOfStock =
              (product.variants && product.variants.length > 0
                ? product.variants.reduce((acc, curr) => acc + (curr.quantity || 0), 0)
                : product.quantity ?? 0) <= 0 || product.sold;

            return (
              <div
                key={item._id}
                onClick={() => navigate(`/products/${product._id}`)}
                className="group relative bg-white border border-light-border/60 rounded-3xl flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.005)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.015)] transition-all duration-300 cursor-pointer h-full overflow-hidden"
              >
                {/* Remove Icon */}
                <button
                  onClick={(e) => handleRemove(product._id, e)}
                  disabled={removingId === product._id}
                  className="absolute top-3 right-3 z-10 p-2 bg-white/95 hover:bg-red-50 text-muted-gray hover:text-red-500 rounded-full border border-light-border/40 shadow-2xs transition-all duration-300 disabled:cursor-not-allowed cursor-pointer"
                  title="Remove from wishlist"
                >
                  {removingId === product._id ? (
                    <Loader2 size={13} className="animate-spin text-red-500" />
                  ) : (
                    <X size={13} />
                  )}
                </button>

                <div>
                  {/* Image */}
                  <div
                    className={`w-full h-36 sm:h-44 bg-soft-bg/80 flex items-center justify-center p-3.5 overflow-hidden relative border-b border-light-border/20 ${
                      isOutOfStock ? "grayscale" : ""
                    }`}
                  >
                    <img
                      src={product.imgUrl}
                      alt={product.heading}
                      className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-dark-navy/40 flex justify-center items-center rounded-xl">
                        <span className="bg-red-655 text-white font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="p-4 flex-grow flex flex-col justify-between text-left">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-muted-gray uppercase tracking-widest font-extrabold block">
                        {product.categoryId?.name || "Product"}
                      </span>
                      <h3 className="font-extrabold text-dark-navy text-xs sm:text-sm mt-1 line-clamp-2 min-h-[32px] sm:min-h-[40px] leading-snug">
                        {product.heading}
                      </h3>
                      <span className="text-[10px] sm:text-[11px] text-muted-gray font-semibold mt-1.5 block">
                        {product.brandId?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div>
                  <div className="flex items-center gap-2 mb-3.5 px-4 text-left">
                    <span className="font-extrabold text-sm sm:text-base text-dark-navy">
                      ₹{getMinPrice(product).toLocaleString()}
                    </span>
                  </div>

                  <button
                    disabled={isOutOfStock}
                    onClick={(e) => handleMoveToCart(item, e)}
                    className={`w-full py-3.5 text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 border-t ${
                      isOutOfStock
                        ? "bg-slate-50 text-slate-400 border-light-border/40 cursor-not-allowed"
                        : "bg-accent-light hover:bg-primary text-primary hover:text-white border-light-border/40 cursor-pointer"
                    }`}
                  >
                    <ShoppingCart size={13} />
                    Move to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
