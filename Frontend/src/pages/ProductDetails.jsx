import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/ProductApi";
import { sentToCart } from "../api/CartApi";
import { toggleWishlist } from "../api/WishlistApi";
import { ChevronLeft, ChevronRight, Heart, Loader2, ArrowLeft } from "lucide-react";

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
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-primary hover:text-white text-dark-navy p-2.5 rounded-full shadow-xs backdrop-blur-xs transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                {/* Right Arrow */}
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-primary hover:text-white text-dark-navy p-2.5 rounded-full shadow-xs backdrop-blur-xs transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer"
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

          <p className="text-2xl font-extrabold text-primary mt-1">
            ₹
            {(activeVariant
              ? activeVariant.price
              : product.price || (product.variants && product.variants.length > 0 ? product.variants[0].price : 0)
            ).toLocaleString()}
          </p>



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

          <div className="pt-2">
            <h3 className="text-sm font-extrabold text-dark-navy uppercase tracking-wider mb-2">Product Description</h3>
            <p className="text-xs sm:text-sm text-muted-gray leading-relaxed text-justify whitespace-pre-wrap font-medium">
              {activeVariant?.description || product.description}
            </p>
          </div>

          <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-light-border/60 p-4 z-40 flex gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] md:static md:w-auto md:bg-transparent md:border-0 md:p-0 md:shadow-none md:mt-6 md:z-auto">
            <button
              onClick={handleWishlistToggle}
              className={`w-12 h-12 p-0 flex-shrink-0 md:w-auto md:h-auto md:flex-none md:py-3 md:px-5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border cursor-pointer outline-none ${
                isWishlisted
                  ? "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100/50"
                  : "bg-white border-light-border text-dark-navy hover:bg-slate-50"
              }`}
            >
              <Heart
                size={22}
                className={
                  isWishlisted ? "fill-rose-500 text-rose-500" : "text-muted-gray"
                }
              />
              <span className="hidden md:inline text-xs">
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </span>
            </button>
            
            <button
              className={`flex-1 md:flex-none py-3.5 px-8 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-xs uppercase tracking-wider ${
                isOutOfStock
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-light-border/30"
                  : "bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white cursor-pointer shadow-md hover:shadow-lg active:scale-95"
              }`}
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
            >
              {adding ? (
                <>
                  <Loader2 size={14} className="animate-spin text-current" />
                  <span>Adding...</span>
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

      {/* Seller / Vendor Info Card (Amazon & Flipkart Style at Bottom) */}
      <div className="bg-slate-50/50 rounded-3xl p-5 border border-light-border/40 mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center font-bold text-sm">
            🏪
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest block leading-none mb-1 text-left">
              Sold By
            </span>
            <span className="text-sm font-black text-dark-navy block text-left">
              {product.vendorId?.businessName || "YoCart Official Store"}
            </span>
            {product.vendorId && (
              <span className="text-[10px] text-muted-gray font-semibold block mt-0.5 text-left">
                GSTIN: {product.vendorId.gstin || "N/A"}
              </span>
            )}
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-light-border/40 sm:pl-6 flex-shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 sm:gap-0 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-light-border/30 sm:border-t-0">
          <div>
            <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest block leading-none mb-1 text-left sm:text-right">
              Seller Products
            </span>
            <span className="text-sm font-black text-primary block text-left sm:text-right">
              {vendorProductsCount} Items
            </span>
          </div>
          <Link
            to={product.vendorId?._id ? `/store/${product.vendorId._id}` : "/products"}
            className="text-[9px] font-extrabold text-accent hover:underline block mt-1 uppercase tracking-wider text-right"
          >
            View Store
          </Link>
        </div>
      </div>
      
      
      {toast && (
        <div className="fixed bottom-[76px] left-1/2 -translate-x-1/2 md:bottom-5 md:right-5 md:left-auto md:translate-x-0 z-50 bg-dark-navy border border-light-border/10 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn max-w-[90vw] w-max">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0"></span>
          {toast}
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
