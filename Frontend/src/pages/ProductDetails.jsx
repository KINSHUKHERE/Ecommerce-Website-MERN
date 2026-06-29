import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/ProductApi";
import { sentToCart } from "../api/CartApi";
import { toggleWishlist } from "../api/WishlistApi";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState("");
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const checkWishlist = () => {
      const cached = localStorage.getItem("yocart_wishlist_ids");
      if (cached) {
        setIsWishlisted(JSON.parse(cached).includes(productId));
      }
    };
    checkWishlist();

    window.addEventListener("wishlistUpdated", checkWishlist);
    return () => {
      window.removeEventListener("wishlistUpdated", checkWishlist);
    };
  }, [productId]);

  const handleWishlistToggle = async () => {
    const userObj = JSON.parse(localStorage.getItem("user"));
    if (!userObj) {
      navigate("/login");
      return;
    }

    try {
      const res = await toggleWishlist(productId);
      const newIds = res.data.wishlistIds || [];
      localStorage.setItem("yocart_wishlist_ids", JSON.stringify(newIds));
      setIsWishlisted(res.data.isWishlisted);
      window.dispatchEvent(new Event("wishlistUpdated"));

      setToast(
        res.data.isWishlisted
          ? `"${product?.heading}" added to wishlist! ❤️`
          : `"${product?.heading}" removed from wishlist.`,
      );
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      console.log("Error toggling wishlist", err);
      setToast("Failed to update wishlist");
      setTimeout(() => setToast(""), 3000);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProduct();
      const selectedProduct = res.data.data.find(
        (item) => item._id === productId,
      );

      setProduct(selectedProduct);
    } catch (err) {
      console.log("Unable to fetch products: ", err);
    }
  };

  useEffect(() => {
    if (product) {
      document.title = `${product.heading || "Product Details"} | YoCart`;

      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", product.description || "");
      }

      // Initialize selected options with first variant's attributes
      const initialOptions = {};
      if (product.options && product.options.length > 0) {
        if (product.variants && product.variants.length > 0) {
          product.variants[0].attributes.forEach((attr) => {
            initialOptions[attr.name] = attr.value;
          });
        } else {
          product.options.forEach((opt) => {
            initialOptions[opt.name] = opt.values[0] || "";
          });
        }
      }
      setSelectedOptions(initialOptions);
      setActiveImgIndex(0);
    }
  }, [product]);
  // Find variant matching current selection
  const activeVariant = product?.variants?.find((v) => {
    return v.attributes.every(
      (attr) => selectedOptions[attr.name] === attr.value,
    );
  });

  // Reset active image index when active variant changes
  useEffect(() => {
    setActiveImgIndex(0);
  }, [activeVariant?._id]);

  // If wrong productId or product not found
  if (!product) {
    return (
      <div className="flex-grow w-full bg-gray-50 py-20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-gray-500 mt-4 animate-pulse">
          Loading product details...
        </p>
      </div>
    );
  }

  const getProductTotalStock = (p) => {
    if (p.variants && p.variants.length > 0) {
      return p.variants.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    }
    return p.quantity ?? 0;
  };

  const stockCount = activeVariant
    ? activeVariant.quantity
    : getProductTotalStock(product);
  const isOutOfStock = stockCount <= 0 || product.sold;

  const handleAddToCart = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        navigate("/login");
        return;
      }

      if (product.options && product.options.length > 0 && !activeVariant) {
        setToast("Please select all options first");
        setTimeout(() => setToast(""), 3000);
        return;
      }

      setAdding(true);
      const cartData = {
        userId: user._id,
        productId: product._id,
        variantId: activeVariant ? activeVariant._id : undefined,
        quantity: 1,
      };

      const response = await sentToCart(cartData);
      window.dispatchEvent(new Event("cartUpdated"));

      setToast(`"${product.heading}" added to cart!`);
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

  const allImages =
    activeVariant && activeVariant.images && activeVariant.images.length > 0
      ? activeVariant.images
      : [product.imgUrl, ...(product.images || [])].filter(Boolean);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  const nextSlide = () => {
    setActiveImgIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveImgIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Interactive Image Slider */}
        <div className="flex flex-col gap-4 w-full">
          <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="bg-gray-100 rounded-2xl p-4 flex justify-center items-center relative aspect-[4/3] max-h-96 w-full group overflow-hidden border border-gray-150 shadow-sm touch-pan-y"
          >
            <img
              src={allImages[activeImgIndex]}
              alt={product.heading}
              className="max-h-full max-w-full object-contain rounded-lg transition-all duration-300 transform scale-100 hover:scale-105"
            />

            {allImages.length > 1 && (
              <>
                {/* Left Arrow */}
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-[#088178] hover:text-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                {/* Right Arrow */}
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-[#088178] hover:text-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails list */}
          {allImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-none">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onMouseEnter={() => setActiveImgIndex(idx)}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 bg-white border rounded-xl overflow-hidden p-1.5 transition-all duration-200 cursor-pointer ${
                    activeImgIndex === idx
                      ? "border-[#088178] ring-2 ring-[#088178]/25 shadow-sm"
                      : "border-gray-200 hover:border-[#088178]/50"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 text-left">
          <div className="flex gap-3 items-center flex-wrap">
            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
              {product.categoryId?.name}
            </span>

            <span className="bg-[#15877F]/10 px-3 py-1 rounded-full text-sm text-[#15877F] font-medium">
              {product.brandId?.name}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                isOutOfStock
                  ? "bg-red-50 text-red-600"
                  : stockCount <= 3
                    ? "bg-amber-50 text-amber-600 animate-pulse"
                    : "bg-green-50 text-green-600"
              }`}
            >
              {isOutOfStock ? "Sold Out" : `${stockCount} Items Left`}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {product.heading}
          </h1>

          <p className="text-2xl font-bold text-indigo-650">
            ₹
            {(activeVariant
              ? activeVariant.price
              : product.price || 0
            ).toLocaleString()}
          </p>

          {/* Option Selectors Swatches */}
          {product.options && product.options.length > 0 && (
            <div className="flex flex-col gap-4 border-y py-4 my-2">
              {product.options.map((opt) => (
                <div key={opt.name} className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Select {opt.name}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val) => {
                      const isSelected = selectedOptions[opt.name] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [opt.name]: val,
                            }))
                          }
                          className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#088178] border-[#088178] text-white shadow-sm shadow-[#088178]/20"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className=" pt-4">
            <h3 className="text-lg font-semibold mb-2">Product Description</h3>
            <p className="text-gray-600 leading-relaxed text-justify whitespace-pre-wrap">
              {activeVariant?.description || product.description}
            </p>
          </div>

          <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-150 p-3.5 z-40 flex gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] md:static md:w-auto md:bg-transparent md:border-0 md:p-0 md:shadow-none md:mt-6 md:z-auto">
            <button
              onClick={handleWishlistToggle}
              className={`w-12 h-12 flex-shrink-0 md:w-auto md:h-auto md:flex-none py-3.5 md:px-6 rounded-xl md:rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 border ${
                isWishlisted
                  ? "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100/70"
                  : "bg-white border-gray-200 text-gray-750 hover:bg-gray-50"
              }`}
            >
              <Heart
                size={18}
                className={
                  isWishlisted ? "fill-rose-500 text-rose-500" : "text-gray-500"
                }
              />
              <span className="hidden md:inline">
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </span>
            </button>
            <button
              className={`flex-1 md:flex-none py-3.5 px-6 rounded-xl md:rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#088178] hover:bg-[#06635c] text-white cursor-pointer shadow-md shadow-[#088178]/10 active:scale-98"
              }`}
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
            >
              {adding ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </>
              ) : isOutOfStock ? (
                "Sold Out"
              ) : (
                "Add to Cart"
              )}
            </button>
          </div>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900/95 border border-gray-800 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {toast}
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
