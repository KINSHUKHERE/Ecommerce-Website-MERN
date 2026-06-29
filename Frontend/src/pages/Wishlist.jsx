import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../api/WishlistApi";
import { sentToCart } from "../api/CartApi";
import {
  Heart,
  ShoppingCart,
  Trash2,
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

    // If product has options (e.g. Size, Color), we direct the user to the product page to choose the option
    if (product.options && product.options.length > 0) {
      navigate(`/products/${product._id}`);
      return;
    }

    setRemovingId(product._id);
    try {
      // Find default variant
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

      // Remove from wishlist
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

  const hasPriceRange = (product) => {
    if (product.variants && product.variants.length > 1) {
      const prices = product.variants.map((v) => v.price);
      return Math.min(...prices) !== Math.max(...prices);
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <Loader2 className="animate-spin text-[#088178] w-10 h-10 mb-4" />
        <p className="text-sm font-normal text-gray-500 animate-pulse">
          Opening your wishlist...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 leading-normal">
      {/* Toast Alert Widget */}
      {message && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-150 shadow-md animate-slideIn">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              toastType === "success"
                ? "bg-green-50 text-green-600 border border-green-100"
                : "bg-red-50 text-red-655 border border-red-100"
            }`}
          >
            {toastType === "success" ? <Check size={14} /> : <X size={14} />}
          </div>
          <span className="text-sm font-medium text-gray-800">{message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 md:mb-12 border-b border-slate-100 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
          My Wishlist
          {wishlist.length > 0 && (
            <span className="bg-rose-50 text-rose-600 border border-rose-100/50 text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-sm ml-2">
              {wishlist.length}
            </span>
          )}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-2 font-normal">
          Manage your saved products and move them to your shopping cart.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-16 px-6 bg-gradient-to-b from-white to-slate-50/30 border border-slate-100/80 rounded-3xl p-10 max-w-lg mx-auto shadow-[0_10px_40px_-15px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col items-center">
          {/* Ambient lighting backdrop */}
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl"></div>
          
          <div className="relative mb-6">
            {/* Ambient pulsing backdrop */}
            <div className="absolute inset-0 bg-rose-500/10 rounded-full scale-125 blur-md animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-tr from-rose-50 to-pink-50 text-rose-500 rounded-full flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_10px_20px_-5px_rgba(244,63,94,0.12)] border border-rose-100/60">
              <Heart size={32} className="fill-rose-500/20 stroke-[2]" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Your Wishlist is Empty
          </h2>
          <p className="text-gray-500 text-sm mt-3 max-w-sm mx-auto leading-relaxed font-normal">
            Looks like you haven't added anything to your wishlist yet. Explore our catalog to find items you love!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 mt-8 px-8 py-3.5 bg-slate-900 hover:bg-[#088178] text-white text-sm font-bold rounded-xl shadow-[0_10px_20px_-5px_rgba(15,23,42,0.15)] hover:shadow-[0_10px_20px_-5px_rgba(8,129,120,0.25)] transition-all duration-300 active:scale-95 cursor-pointer group"
          >
            Start Shopping
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300 text-white/80" />
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
                className="group relative bg-white border border-gray-100 rounded-2xl flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.07)] transition-all duration-300 cursor-pointer h-full overflow-hidden"
              >
                {/* Remove Icon */}
                <button
                  onClick={(e) => handleRemove(product._id, e)}
                  disabled={removingId === product._id}
                  className="absolute top-2.5 right-2.5 z-10 p-1.5 bg-white/95 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full border border-gray-100 shadow-sm transition-all duration-200 disabled:cursor-not-allowed"
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
                    className={`w-full h-36 sm:h-44 bg-gray-50 flex items-center justify-center p-3.5 overflow-hidden relative border-b border-gray-50 ${
                      isOutOfStock ? "grayscale" : ""
                    }`}
                  >
                    <img
                      src={product.imgUrl}
                      alt={product.heading}
                      className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/45 flex justify-center items-center rounded-xl">
                        <span className="bg-red-600 text-white font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded uppercase tracking-wider shadow">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between text-left">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider font-extrabold block">
                        {product.categoryId?.name || "Product"}
                      </span>
                      <h3 className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5 line-clamp-2 min-h-[32px] sm:min-h-[40px] leading-snug">
                        {product.heading}
                      </h3>
                      <span className="text-[10px] sm:text-[11px] text-gray-450 font-semibold mt-1 block">
                        {product.brandId?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div>
                  <div className="flex items-center gap-2 mb-3.5 px-3 sm:px-4">
                    <span className="font-extrabold text-sm sm:text-base text-slate-800">
                      ₹{getMinPrice(product).toLocaleString()}
                    </span>
                  </div>

                  <button
                    disabled={isOutOfStock}
                    onClick={(e) => handleMoveToCart(item, e)}
                    className={`w-full py-3 text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors duration-300 border-t ${
                      isOutOfStock
                        ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
                        : "bg-slate-900 hover:bg-[#088178] text-white border-slate-900 hover:border-[#088178] cursor-pointer"
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
