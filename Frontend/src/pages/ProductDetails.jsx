import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/ProductApi";
import { sentToCart } from "../api/CartApi";
import { toggleWishlist } from "../api/WishlistApi";
import { getProductReviewsApi } from "../api/ReviewApi";
import { ChevronLeft, ChevronRight, Heart, Loader2, ArrowLeft, X, Scale } from "lucide-react";

const ExpandableReviewText = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const limit = 180; // Character limit before truncation
  
  if (text.length <= limit) {
    return <p className="text-xs sm:text-sm text-muted-gray leading-relaxed font-semibold pl-1">{text}</p>;
  }
  
  return (
    <div className="pl-1">
      <p className="text-xs sm:text-sm text-muted-gray leading-relaxed font-semibold inline">
        {expanded ? text : `${text.substring(0, limit)}... `}
      </p>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-[10px] font-black text-primary hover:underline ml-1.5 uppercase tracking-wider inline-block cursor-pointer bg-transparent border-none p-0 outline-none"
      >
        {expanded ? "Show Less" : "Show More"}
      </button>
    </div>
  );
};

const getRatingColorClass = (rating) => {
  const r = Math.round(Number(rating));
  if (r >= 4) return "text-emerald-500";
  if (r === 3) return "text-amber-500";
  return "text-rose-500";
};

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [starFilter, setStarFilter] = useState("All");
  const [descExpanded, setDescExpanded] = useState(false);

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

  const [isCompared, setIsCompared] = useState(false);
  const [isCompareLimitReached, setIsCompareLimitReached] = useState(false);

  useEffect(() => {
    const checkCompare = () => {
      const cached = localStorage.getItem("yocart_compare_ids");
      if (cached) {
        const compareIds = JSON.parse(cached);
        setIsCompared(compareIds.includes(productId));
        setIsCompareLimitReached(compareIds.length >= 4);
      } else {
        setIsCompared(false);
        setIsCompareLimitReached(false);
      }
    };
    checkCompare();

    window.addEventListener("compareUpdated", checkCompare);
    return () => {
      window.removeEventListener("compareUpdated", checkCompare);
    };
  }, [productId]);

  const handleCompareToggle = (e) => {
    e.stopPropagation();
    const cached = localStorage.getItem("yocart_compare_ids");
    let compareIds = cached ? JSON.parse(cached) : [];
    
    if (compareIds.includes(productId)) {
      compareIds = compareIds.filter(id => id !== productId);
      localStorage.setItem("yocart_compare_ids", JSON.stringify(compareIds));
      window.dispatchEvent(new Event("compareUpdated"));
      showToast("Removed from comparison.");
    } else {
      if (compareIds.length >= 4) {
        showToast("You can compare up to 4 products.", "error");
        return;
      }
      compareIds.push(productId);
      localStorage.setItem("yocart_compare_ids", JSON.stringify(compareIds));
      window.dispatchEvent(new Event("compareUpdated"));
      showToast("Added to comparison! ⚖");
    }
  };

  const [globalSaleActive, setGlobalSaleActive] = useState(() => {
    try {
      const cached = sessionStorage.getItem("globalSaleConfig");
      return cached ? JSON.parse(cached).isGlobalSaleActive : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleConfigEvent = () => {
      try {
        const cached = sessionStorage.getItem("globalSaleConfig");
        setGlobalSaleActive(cached ? JSON.parse(cached).isGlobalSaleActive : false);
      } catch {
        setGlobalSaleActive(false);
      }
    };
    window.addEventListener("saleConfigUpdated", handleConfigEvent);
    return () => window.removeEventListener("saleConfigUpdated", handleConfigEvent);
  }, []);

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

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await getProductReviewsApi(productId);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchReviews();
  }, [productId]);

  const [vendorProductsCount, setVendorProductsCount] = useState(0);

  const fetchProducts = async () => {
    try {
      const res = await getProduct();
      const allFetchedProducts = res.data.data || [];
      const selectedProduct = allFetchedProducts.find(
        (item) => item._id === productId,
      );

      setProduct(selectedProduct);

      if (selectedProduct) {
        const vId = selectedProduct.vendorId?._id || selectedProduct.vendorId;
        if (vId) {
          const count = allFetchedProducts.filter(
            (p) => {
              const pvId = p.vendorId?._id || p.vendorId;
              return pvId && pvId.toString() === vId.toString();
            }
          ).length;
          setVendorProductsCount(count);
        } else {
          const count = allFetchedProducts.filter(
            (p) => !p.vendorId
          ).length;
          setVendorProductsCount(count);
        }
      }
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

  const isOptionValueAvailable = (optName, val) => {
    if (!product.variants || product.variants.length === 0) return true;
    return product.variants.some((v) => {
      const hasClickedValue = v.attributes.some(
        (a) => a.name === optName && a.value === val
      );
      if (!hasClickedValue) return false;
      return v.attributes.every((attr) => {
        if (attr.name === optName) return true;
        return selectedOptions[attr.name] === attr.value;
      });
    });
  };

  const handleSelectOption = (optName, val) => {
    const targetOptions = { ...selectedOptions, [optName]: val };
    const exactMatch = product.variants?.find((v) => {
      return v.attributes.every((attr) => targetOptions[attr.name] === attr.value);
    });

    if (exactMatch) {
      setSelectedOptions(targetOptions);
      return;
    }

    const matchingVariants = product.variants?.filter((v) => {
      const attr = v.attributes.find((a) => a.name === optName);
      return attr && attr.value === val;
    }) || [];

    if (matchingVariants.length > 0) {
      let bestVariant = matchingVariants[0];
      let maxMatches = -1;

      matchingVariants.forEach((v) => {
        let matches = 0;
        v.attributes.forEach((attr) => {
          if (attr.name !== optName && selectedOptions[attr.name] === attr.value) {
            matches++;
          }
        });
        if (matches > maxMatches) {
          maxMatches = matches;
          bestVariant = v;
        }
      });

      const newOptions = {};
      bestVariant.attributes.forEach((attr) => {
        newOptions[attr.name] = attr.value;
      });
      setSelectedOptions(newOptions);
    } else {
      setSelectedOptions(targetOptions);
    }
  };

  // Reset active image index when active variant changes
  useEffect(() => {
    setActiveImgIndex(0);
  }, [activeVariant?._id]);

  // If wrong productId or product not found
  if (!product) {
    return (
      <div className="flex-grow w-full bg-soft-bg/30 py-20 flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-muted-gray text-sm font-semibold animate-pulse">
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

      await sentToCart(cartData);
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

  const allImages = Array.from(
    new Set([
      ...(activeVariant && activeVariant.images && activeVariant.images.length > 0 ? activeVariant.images : []),
      product.imgUrl,
      ...(product.images || [])
    ])
  ).filter(Boolean);

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
    <div className="max-w-6xl mx-auto p-6 md:p-8 pb-24 md:pb-12 text-dark-navy antialiased">
      
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/products"
          className="group inline-flex items-center gap-2 px-5 py-2 bg-white border border-light-border text-dark-navy rounded-xl hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all duration-300 shadow-2xs font-semibold text-xs cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Shop
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Interactive Image Slider */}
        <div className="flex flex-col gap-4 w-full">
          <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="bg-soft-bg/80 rounded-3xl p-4 flex justify-center items-center relative aspect-[4/3] max-h-96 w-full group overflow-hidden border border-light-border/40 shadow-2xs touch-pan-y"
          >
            <img
              src={allImages[activeImgIndex]}
              alt={product.heading}
              className="max-h-full max-w-full object-contain rounded-xl transition-all duration-300 transform scale-100 hover:scale-103"
            />

            {allImages.length > 1 && (
              <>
                {/* Left Arrow */}
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-primary hover:text-white text-dark-navy p-2.5 rounded-full shadow-xs backdrop-blur-xs transition-all duration-300 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                {/* Right Arrow */}
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-primary hover:text-white text-dark-navy p-2.5 rounded-full shadow-xs backdrop-blur-xs transition-all duration-300 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronRight size={18} />
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
                  className={`relative w-20 h-20 flex-shrink-0 bg-white border rounded-2xl overflow-hidden p-1.5 transition-all duration-300 cursor-pointer ${
                    activeImgIndex === idx
                      ? "border-primary ring-2 ring-primary/20 shadow-xs"
                      : "border-light-border hover:border-primary/50"
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

        {/* Product details panel */}
        <div className="flex flex-col gap-4 text-left">
          <div className="flex gap-2.5 items-center flex-wrap">
            <span className="bg-slate-100 px-3.5 py-1 rounded-full text-xs text-muted-gray font-semibold select-none">
              {product.categoryId?.name}
            </span>

            <span className="bg-accent-light px-3.5 py-1 rounded-full text-xs text-primary font-bold border border-primary/5 select-none">
              {product.brandId?.name}
            </span>

            <span
              className={`px-3.5 py-1 rounded-full text-xs font-bold border ${
                isOutOfStock
                  ? "bg-red-50 border-red-100 text-red-600"
                  : stockCount <= 3
                    ? "bg-amber-50 border-amber-100 text-amber-600 animate-pulse"
                    : "bg-emerald-50 border-emerald-100 text-emerald-600"
              }`}
            >
              {isOutOfStock ? "Sold Out" : `${stockCount} In Stock`}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-navy leading-tight tracking-tight mt-1.5">
            {product.heading}
          </h1>

          {(() => {
            const totalReviews = reviews.length;
            const averageRating = totalReviews > 0
              ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
              : 0;

            return totalReviews > 0 ? (
              <div className="flex items-center gap-2 mt-2">
                <div className={`flex ${getRatingColorClass(averageRating)} gap-0.5 text-sm`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                      {star <= Math.round(Number(averageRating)) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-black text-dark-navy">
                  {averageRating}
                </span>
                <span className="text-xs text-muted-gray font-semibold">
                  ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                </span>
              </div>
            ) : null;
          })()}

          {(() => {
            const hasActiveVariant = activeVariant;
            const currentItem = hasActiveVariant ? activeVariant : product;
            
            const fallbackPrice = (!hasActiveVariant && product.variants && product.variants.length > 0) 
              ? product.variants[0].price 
              : 0;
            const originalPrice = currentItem.price || fallbackPrice;

            const isItemOnSale = globalSaleActive && currentItem.onSale && currentItem.salePrice > 0;
            const salePrice = isItemOnSale ? currentItem.salePrice : originalPrice;

            if (isItemOnSale) {
              const discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
              return (
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="flex items-center gap-3.5 flex-wrap">
                    <span className="text-3xl font-black text-red-600">
                      ₹{salePrice.toLocaleString()}
                    </span>
                    <span className="text-sm line-through text-muted-gray font-bold">
                      ₹{originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 uppercase tracking-wider">
                      {discountPercent}% OFF
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-orange-655 tracking-widest uppercase flex items-center gap-1">
                    🎉 Festive Sale Special Price
                  </span>
                </div>
              );
            }

            return (
              <p className="text-2xl font-extrabold text-primary mt-1">
                ₹{originalPrice.toLocaleString()}
              </p>
            );
          })()}



          {/* Option Selectors Swatches */}
          {product.options && product.options.length > 0 && product.variants && product.variants.length > 0 && (
            <div className="flex flex-col gap-4 border-y border-light-border/40 py-5 my-2">
              {product.options.map((opt) => (
                <div key={opt.name} className="flex flex-col gap-2">
                  <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">
                    Select {opt.name}
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {opt.values.map((val) => {
                      const isSelected = selectedOptions[opt.name] === val;
                      const isAvailable = isOptionValueAvailable(opt.name, val);
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleSelectOption(opt.name, val)}
                          className={`px-4.5 py-2 text-xs font-bold rounded-xl border transition-all duration-350 cursor-pointer relative overflow-hidden ${
                            isSelected
                              ? "bg-primary border-primary text-white shadow-xs"
                              : isAvailable
                              ? "border-light-border bg-white text-muted-gray hover:border-muted-gray"
                              : "border-dashed border-light-border/40 bg-slate-50/50 text-slate-400 opacity-60 hover:border-light-border"
                          }`}
                          title={!isAvailable ? "Not available in this combination" : undefined}
                        >
                          {val}
                          {!isAvailable && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-[120%] h-[1.5px] bg-slate-400/50 rotate-12 transform"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add to Wishlist + Add to Cart + Compare — right below variants */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 mt-1">
            <button
              onClick={handleWishlistToggle}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 border cursor-pointer outline-none text-xs flex-shrink-0 ${
                isWishlisted
                  ? "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100/50"
                  : "bg-white border-light-border text-dark-navy hover:bg-slate-50"
              }`}
            >
              <Heart
                size={16}
                className={isWishlisted ? "fill-rose-500 text-rose-500" : "text-muted-gray"}
              />
              <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
            </button>

            {/* Compare Button */}
            <button
              onClick={handleCompareToggle}
              disabled={isCompareLimitReached && !isCompared}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 border text-xs flex-shrink-0 outline-none ${
                isCompared
                  ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 cursor-pointer"
                  : isCompareLimitReached
                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white border-light-border text-dark-navy hover:bg-slate-50 cursor-pointer"
              }`}
            >
              <Scale
                size={16}
                className={isCompared ? "text-primary stroke-[2.5]" : "text-muted-gray"}
              />
              <span>
                {isCompared
                  ? "Added to Compare"
                  : isCompareLimitReached
                    ? "Limit Reached (4)"
                    : "Compare"}
              </span>
            </button>

            <button
              className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-xs uppercase tracking-wider ${
                isOutOfStock
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-light-border/30"
                  : "bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white cursor-pointer shadow-md hover:shadow-lg active:scale-95"
              }`}
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
            >
              {adding ? (
                <><Loader2 size={14} className="animate-spin text-current" /><span>Adding...</span></>
              ) : isOutOfStock ? (
                "Sold Out"
              ) : (
                "Add to Cart"
              )}
            </button>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-extrabold text-dark-navy uppercase tracking-wider mb-2">Product Description</h3>
            {(() => {
              const fullDesc = activeVariant?.description || product.description || "";
              const charLimit = 350; // Dynamic limit for product description
              
              if (fullDesc.length <= charLimit) {
                return (
                  <p className="text-xs sm:text-sm text-muted-gray leading-relaxed text-justify whitespace-pre-wrap font-medium">
                    {fullDesc}
                  </p>
                );
              }
              
              return (
                <div className="space-y-1.5 text-justify">
                  <p className="text-xs sm:text-sm text-muted-gray leading-relaxed whitespace-pre-wrap font-medium inline">
                    {descExpanded ? fullDesc : `${fullDesc.substring(0, charLimit)}... `}
                  </p>
                  <button
                    type="button"
                    onClick={() => setDescExpanded(!descExpanded)}
                    className="text-[10px] font-black text-primary hover:underline ml-1 uppercase tracking-wider inline-block cursor-pointer bg-transparent border-none p-0 outline-none"
                  >
                    {descExpanded ? "See Less" : "See More"}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Seller / Vendor Info Card (Amazon & Flipkart Style at Bottom) */}
      <div className="bg-slate-50/50 rounded-2xl p-4 sm:p-5 border border-light-border/40 mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 max-w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center font-bold text-sm shrink-0">
            🏪
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] font-black text-muted-gray uppercase tracking-widest block leading-none mb-0.5 sm:mb-1 text-left">
              Sold By
            </span>
            <span className="text-xs sm:text-sm font-black text-dark-navy block text-left">
              {!product.vendorId || product.vendorId.role === "admin"
                ? "YoCart Official Store"
                : (product.vendorId.businessName || "YoCart Official Store")}
            </span>
            {product.vendorId && product.vendorId.role !== "admin" && (
              <span className="text-[9px] sm:text-[10px] text-muted-gray font-bold block mt-0.5 text-left">
                GSTIN: {product.vendorId.gstin || "N/A"}
              </span>
            )}
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-light-border/40 sm:pl-5 flex-shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 sm:gap-0 mt-2.5 pt-2.5 border-t border-light-border/20 sm:mt-0 sm:pt-0 sm:border-t-0">
          <div>
            <span className="text-[9px] sm:text-[10px] font-black text-muted-gray uppercase tracking-widest block leading-none mb-0.5 sm:mb-1 text-left sm:text-right">
              Seller Products
            </span>
            <span className="text-xs sm:text-sm font-black text-primary block text-left sm:text-right">
              {vendorProductsCount} {vendorProductsCount === 1 ? "Item" : "Items"}
            </span>
          </div>
          <Link
            to={product.vendorId?._id ? `/store/${product.vendorId._id}` : "/products"}
            className="text-[9px] sm:text-[10px] font-black text-accent hover:underline block uppercase tracking-wider text-right"
          >
            View Store
          </Link>
        </div>
      </div>

      {/* Customer Reviews Section */}
      {(() => {
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
          ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
          : 0;

        return (
          <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xs mt-8 text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-light-border/30">
              <div>
                <h3 className="text-base font-extrabold text-dark-navy uppercase tracking-wider">
                  Customer Reviews
                </h3>
                <p className="text-xs text-muted-gray mt-1 font-semibold">
                  Read feedback from verified buyers of this product.
                </p>
              </div>
              {totalReviews > 0 && (
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl">
                  <span className="text-2xl font-black text-dark-navy leading-none">
                    {averageRating}
                  </span>
                  <div>
                    <div className={`flex ${getRatingColorClass(averageRating)} gap-0.5 text-xs`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}>
                          {star <= Math.round(Number(averageRating)) ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-gray font-bold uppercase tracking-wider block mt-0.5">
                      Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {loadingReviews ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-primary w-6 h-6 mb-2" />
                <span className="text-xs text-muted-gray font-semibold uppercase tracking-wider animate-pulse">
                  Loading Reviews...
                </span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-10 text-center px-4 flex flex-col items-center">
                <span className="text-3xl mb-2.5">💬</span>
                <h4 className="text-sm font-extrabold text-dark-navy">No Reviews Yet</h4>
                <p className="text-xs text-muted-gray mt-1 max-w-xs font-semibold leading-relaxed">
                  Purchased this item? You can leave a review from your Order History page after placing an order.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="divide-y divide-light-border/25 space-y-5">
                  {reviews.slice(0, 3).map((rev) => (
                    <div key={rev._id} className="pt-5 first:pt-0 space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center text-xs font-extrabold text-dark-navy uppercase">
                            {rev.userName ? rev.userName.charAt(0) : "U"}
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-dark-navy block leading-none">
                              {rev.userName || "Verified Buyer"}
                            </span>
                            <span className="text-[9px] text-muted-gray font-bold block mt-1">
                              Reviewed on {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
                            </span>
                          </div>
                        </div>
                        
                        {/* Review Stars */}
                        <div className={`flex ${getRatingColorClass(rev.rating)} gap-0.5 text-xs bg-slate-50 border border-slate-100/50 px-2 py-0.5 rounded-lg`}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star}>
                              {star <= rev.rating ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Review Text */}
                      <ExpandableReviewText text={rev.comment} />
                    </div>
                  ))}
                </div>

                {totalReviews > 3 && (
                  <div className="pt-4 text-center border-t border-light-border/20">
                    <button
                      type="button"
                      onClick={() => {
                        setStarFilter("All");
                        setShowAllReviewsModal(true);
                      }}
                      className="px-6 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-xs font-black uppercase tracking-wider rounded-xl transition duration-300 shadow-2xs border border-indigo-100/40 cursor-pointer"
                    >
                      See All Reviews ({totalReviews})
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* See All Reviews Popup Modal */}
            {showAllReviewsModal && (
              <div 
                onClick={() => setShowAllReviewsModal(false)}
                className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fadeIn"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white border border-light-border/60 rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] text-left animate-scaleUp"
                >
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-light-border/30">
                    <div>
                      <h3 className="text-base font-extrabold text-dark-navy uppercase tracking-wider">
                        All Customer Reviews
                      </h3>
                      <p className="text-[11px] text-muted-gray mt-0.5 font-bold uppercase tracking-wider">
                        Based on {totalReviews} reviews • {averageRating} / 5 Rating
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAllReviewsModal(false)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-muted-gray transition cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Rating Filters Bar */}
                  <div className="flex gap-1.5 overflow-x-auto py-3 border-b border-light-border/20 scrollbar-none whitespace-nowrap">
                    {["All", "5", "4", "3", "2", "1"].map((stars) => {
                      const isActive = starFilter === stars;
                      let label = stars === "All" ? "All Stars" : `${stars} ★`;
                      
                      // Count matching reviews
                      const matchingCount = stars === "All" 
                        ? reviews.length
                        : reviews.filter(r => r.rating === Number(stars)).length;

                      return (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setStarFilter(stars)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer select-none ${
                            isActive
                              ? "bg-primary text-white border-primary shadow-xs"
                              : "bg-slate-50 text-muted-gray border-light-border/40 hover:bg-slate-100 hover:text-dark-navy"
                          }`}
                        >
                          {label} ({matchingCount})
                        </button>
                      );
                    })}
                  </div>

                  {/* Reviews List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-light-border/20 pr-1 py-2 space-y-4 scrollbar-thin">
                    {(() => {
                      const filteredReviews = starFilter === "All"
                        ? reviews
                        : reviews.filter(r => r.rating === Number(starFilter));

                      if (filteredReviews.length === 0) {
                        return (
                          <div className="py-12 text-center text-muted-gray flex flex-col items-center">
                            <span className="text-2xl mb-2">⭐</span>
                            <p className="text-xs font-black uppercase tracking-widest">No matching reviews</p>
                            <p className="text-[11px] text-muted-gray mt-1 font-semibold">There are no reviews with a {starFilter} star rating.</p>
                          </div>
                        );
                      }

                      return filteredReviews.map((rev) => (
                        <div key={rev._id} className="pt-4 first:pt-0 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center text-xs font-extrabold text-dark-navy uppercase">
                                {rev.userName ? rev.userName.charAt(0) : "U"}
                              </div>
                              <div>
                                <span className="text-xs font-extrabold text-dark-navy block leading-none">
                                  {rev.userName || "Verified Buyer"}
                                </span>
                                <span className="text-[9px] text-muted-gray font-bold block mt-1">
                                  Reviewed on {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                  })}
                                </span>
                              </div>
                            </div>
                            
                            <div className={`flex ${getRatingColorClass(rev.rating)} gap-0.5 text-xs bg-slate-50 border border-slate-100/50 px-2 py-0.5 rounded-lg`}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star}>
                                  {star <= rev.rating ? "★" : "☆"}
                                </span>
                              ))}
                            </div>
                          </div>

                          <ExpandableReviewText text={rev.comment} />
                        </div>
                      ));
                    })()}
                  </div>

                </div>
              </div>
            )}
          </div>
        );
      })()}
      
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 md:left-auto md:right-5 md:translate-x-0 z-50 bg-dark-navy border border-light-border/10 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn max-w-[90vw] w-max">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0"></span>
          {toast}
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
