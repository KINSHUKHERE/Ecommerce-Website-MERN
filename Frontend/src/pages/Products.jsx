import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import EachProduct from "../components/EachProduct";
import { getProduct } from "../api/ProductApi";
import {
  getCategories,
  getVariants,
} from "../api/CategoryAndVarientApi";

// Premium Skeleton Card Loader Component
const ProductSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8 w-full">
    {Array.from({ length: 6 }).map((_, idx) => (
      <div
        key={idx}
        className="w-full max-w-sm mx-auto p-2.5 sm:p-4 border border-gray-100 rounded-2xl sm:rounded-3xl shadow-sm bg-white animate-pulse flex flex-col justify-between h-full"
      >
        <div>
          <div className="w-full h-36 sm:h-48 md:h-56 lg:h-60 bg-gray-200 rounded-xl sm:rounded-2xl"></div>
          <div className="pt-2 sm:pt-3 px-1 pb-1 flex flex-col gap-2">
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3.5 bg-gray-200 rounded w-3/4 mt-1"></div>
            <div className="h-3 bg-gray-200 rounded w-full mt-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6 mt-1"></div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-50 px-1">
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    ))}
  </div>
);

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Infinite Scroll Pagination states
  const [visibleCount, setVisibleCount] = useState(10);
  const [scrollingLoading, setScrollingLoading] = useState(false);
  const sentinelRef = useRef(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");

  useEffect(() => {
    const loadAllData = async () => {
      try {
        await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchVariants(),
        ]);
      } catch (err) {
        console.log("Error loading data", err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  // Reset visibleCount when any filter/search changes
  useEffect(() => {
    setVisibleCount(10);
  }, [search, selectedCategory, selectedVariant]);

  const fetchProducts = async () => {
    try {
      const res = await getProduct();
      setProducts(res.data.data || []); 
      
    } catch (err) {
      console.error("fetchProducts error:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      console.log("fetchCategories API response:", res.data);
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.error("fetchCategories error:", err);
    }
  };

  const fetchVariants = async () => {
    try {
      const res = await getVariants();
      console.log("fetchVariants API response:", res.data);
      setVariants(res.data?.variants || []);
    } catch (err) {
      console.error("fetchVariants error:", err);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Safe checks to avoid undefined.toLowerCase() or undefined.includes() exceptions
      const itemHeading = item.heading || "";
      const itemCategoryName = item.categoryId?.name || item.category || "";
      const itemVariantName = item.variantId?.name || item.brand || item.variant || "";

      const matchesSearch =
        itemHeading.toLowerCase().includes(search.toLowerCase()) ||
        itemCategoryName.toLowerCase().includes(search.toLowerCase()) ||
        itemVariantName.toLowerCase().includes(search.toLowerCase());

      const itemCategoryId = item.categoryId?._id || item.categoryId || "";
      const matchesCategory =
        selectedCategory === "" ||
        itemCategoryId.toString() === selectedCategory.toString();

      const itemVariantId = item.variantId?._id || item.variantId || "";
      const matchesVariant =
        selectedVariant === "" ||
        itemVariantId.toString() === selectedVariant.toString();

      const isMatch = matchesSearch && matchesCategory && matchesVariant;
      return isMatch;
    });
  }, [
    products,
    search,
    selectedCategory,
    selectedVariant,
  ]);

  const visibleProducts = useMemo(() => {
    console.log("Filtered products list count:", filteredProducts.length);
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Observer to load more items when scrolling to the bottom
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          visibleCount < filteredProducts.length &&
          !scrollingLoading
        ) {
          setScrollingLoading(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 10, filteredProducts.length));
            setScrollingLoading(false);
          }, 450); // 450ms premium transition delay
        }
      },
      { threshold: 0.1 }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [filteredProducts.length, visibleCount, scrollingLoading, loading]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedVariant("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Back Button */}
      <div className="px-4 md:px-10 mb-6">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-[#088178] hover:text-white hover:border-[#088178] transition-all duration-300 shadow-sm font-semibold text-sm"
        >
          <span className="text-lg group-hover:-translate-x-1 transition-transform duration-300">
            &larr;
          </span>
          Back
        </Link>
      </div>

      {/* Heading & Search Box */}
      <div className="text-center mb-6 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-[#222]">
          All Products
        </h1>
        <p className="text-[#465B52] mt-2 text-sm md:text-base">
          Find your favourite premium electronics
        </p>

        {/* Enhanced Search Input */}
        <div className="flex justify-center mt-6">
          <div className="relative w-full max-w-2xl">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <Search size={20} />
            </span>
            <input
              type="text"
              placeholder="Search by product name, category, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-white shadow-sm hover:border-[#15877F] focus:outline-none focus:ring-2 focus:ring-[#15877F]/20 focus:border-[#15877F] transition-all text-gray-800 font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Action Panel (Mobile only) */}
      <div className="block lg:hidden px-4 mb-6">
        <div className="flex justify-between items-center bg-white p-4 border border-gray-100 rounded-2xl shadow-sm">
          <span className="text-sm font-bold text-gray-700">
            Products ({filteredProducts.length})
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                mobileFiltersOpen
                  ? "bg-[#15877F] text-white border-[#15877F] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters {selectedCategory || selectedVariant ? "•" : ""}
            </button>
            {(selectedCategory || selectedVariant || search) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-red-500 font-bold text-xs hover:text-red-600 transition cursor-pointer"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filters Drawer Panel */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            mobileFiltersOpen
              ? "max-h-[500px] mt-3 border border-gray-100 p-5 rounded-2xl bg-white shadow-md"
              : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-5">
            {/* Categories Mobile */}
            <div>
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="h-7 w-16 bg-gray-200 rounded-xl animate-pulse"></div>
                  ))
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setSelectedCategory("");
                        setSelectedVariant("");
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selectedCategory === ""
                          ? "bg-[#15877F] text-white border-[#15877F] shadow-sm"
                          : "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100"
                      }`}
                    >
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category._id}
                        onClick={() => {
                          setSelectedCategory(category._id);
                          setSelectedVariant("");
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          selectedCategory === category._id
                            ? "bg-[#15877F] text-white border-[#15877F] shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Brands Mobile */}
            <div>
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                Brands
              </h3>
              <div className="flex flex-wrap gap-2">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="h-7 w-16 bg-gray-200 rounded-xl animate-pulse"></div>
                  ))
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedVariant("")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selectedVariant === ""
                          ? "bg-[#15877F] text-white border-[#15877F] shadow-sm"
                          : "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100"
                      }`}
                    >
                      All Brands
                    </button>
                    {variants
                      .filter(
                        (variant) =>
                          selectedCategory === "" ||
                          (variant.categoryId?._id || variant.categoryId) === selectedCategory
                      )
                      .map((variant) => (
                        <button
                          key={variant._id}
                          onClick={() => setSelectedVariant(variant._id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            selectedVariant === variant._id
                              ? "bg-[#15877F] text-white border-[#15877F] shadow-sm"
                              : "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100"
                          }`}
                        >
                          {variant.name}
                        </button>
                      ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="px-4 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-fit sticky top-24">
              
              {/* Sidebar Header */}
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[#15877F]" />
                  Filters
                </h2>
                {(selectedCategory || selectedVariant || search) && (
                  <button
                    onClick={clearFilters}
                    className="text-red-500 text-xs font-bold hover:text-red-600 transition flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                )}
              </div>

              {/* Categories Sidebar Section */}
              <div className="mb-8">
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-4">
                  Categories
                </h3>
                <div className="flex flex-col gap-1">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="h-10 bg-gray-100 rounded-xl animate-pulse mb-1.5"></div>
                    ))
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setSelectedCategory("");
                          setSelectedVariant("");
                        }}
                        className={`px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-all border-l-2 cursor-pointer ${
                          selectedCategory === ""
                            ? "bg-[#15877F]/5 border-[#15877F] text-[#15877F]"
                            : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category._id}
                          onClick={() => {
                            setSelectedCategory(category._id);
                            setSelectedVariant("");
                          }}
                          className={`px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-all border-l-2 cursor-pointer ${
                            selectedCategory === category._id
                              ? "bg-[#15877F]/5 border-[#15877F] text-[#15877F]"
                              : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Brands Sidebar Section */}
              <div>
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-4">
                  Brands
                </h3>
                <div className="flex flex-wrap gap-2">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className="h-8 w-16 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))
                  ) : (
                    <>
                      <button
                        onClick={() => setSelectedVariant("")}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          selectedVariant === ""
                            ? "bg-[#15877F] text-white border-[#15877F] shadow-sm shadow-[#15877F]/20"
                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        All Brands
                      </button>
                      {variants
                        .filter(
                          (variant) =>
                            selectedCategory === "" ||
                            (variant.categoryId?._id || variant.categoryId) === selectedCategory
                        )
                        .map((variant) => (
                          <button
                            key={variant._id}
                            onClick={() => setSelectedVariant(variant._id)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              selectedVariant === variant._id
                                ? "bg-[#15877F] text-white border-[#15877F] shadow-sm shadow-[#15877F]/20"
                                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                            }`}
                          >
                            {variant.name}
                          </button>
                        ))}
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Products Grid Content */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl text-gray-800 hidden lg:block">
                Products ({filteredProducts.length})
              </h2>
            </div>

            {loading ? (
              <ProductSkeleton />
            ) : visibleProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  No Products Found
                </h2>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search criteria or clearing filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 px-6 py-3 rounded-xl bg-[#088178] hover:bg-[#06635c] text-white font-bold transition shadow-md shadow-[#088178]/10 cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
                  {visibleProducts.map((product) => (
                    <EachProduct
                      key={product._id}
                      data={product}
                      onRefresh={fetchProducts}
                    />
                  ))}
                </div>

                {/* Infinite Scroll Sentinel / Loading Indicator */}
                {visibleCount < filteredProducts.length && (
                  <div
                    ref={sentinelRef}
                    className="w-full flex flex-col items-center justify-center py-10 mt-6"
                  >
                    {scrollingLoading ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#15877F]"></div>
                        <p className="text-gray-500 text-sm animate-pulse">Loading more premium products...</p>
                      </div>
                    ) : (
                      <div className="h-4"></div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Products;