import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, RotateCcw, Loader2 } from "lucide-react";
import EachProduct from "../components/EachProduct";
import { getProduct } from "../api/ProductApi";
import {
  getCategories,
  getBrands,
} from "../api/CategoryAndBrandApi";

// Premium Skeleton Card Loader Component
const ProductSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
    {Array.from({ length: 6 }).map((_, idx) => (
      <div
        key={idx}
        className="w-full max-w-sm mx-auto p-3 border border-light-border/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.005)] bg-white animate-pulse flex flex-col justify-between h-full"
      >
        <div>
          <div className="w-full h-36 sm:h-48 bg-slate-100 rounded-2xl"></div>
          <div className="pt-3 px-1 pb-1 flex flex-col gap-2">
            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
            <div className="h-3.5 bg-slate-200 rounded w-3/4 mt-1"></div>
            <div className="h-3 bg-slate-200 rounded w-full mt-2"></div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-light-border/40 px-1">
          <div className="h-5 bg-slate-200 rounded w-1/4"></div>
          <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
        </div>
      </div>
    ))}
  </div>
);

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchParams] = useSearchParams();

  // Infinite Scroll Pagination states
  const [visibleCount, setVisibleCount] = useState(10);
  const [scrollingLoading, setScrollingLoading] = useState(false);
  const sentinelRef = useRef(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  useEffect(() => {
    const loadAllData = async () => {
      try {
        await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchBrands(),
        ]);
      } catch (err) {
        console.log("Error loading data", err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    }
    const br = searchParams.get("brand");
    if (br) {
      setSelectedBrand(br);
    }
  }, [searchParams]);

  // Reset visibleCount when any filter/search changes
  useEffect(() => {
    setVisibleCount(10);
  }, [search, selectedCategory, selectedBrand]);

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
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.error("fetchCategories error:", err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await getBrands();
      setBrands(res.data?.brands || []);
    } catch (err) {
      console.error("fetchBrands error:", err);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const itemHeading = item.heading || "";
      const itemCategoryName = item.categoryId?.name || item.category || "";
      const itemBrandName = item.brandId?.name || item.brand || "";

      const matchesSearch =
        itemHeading.toLowerCase().includes(search.toLowerCase()) ||
        itemCategoryName.toLowerCase().includes(search.toLowerCase()) ||
        itemBrandName.toLowerCase().includes(search.toLowerCase());

      const itemCategoryId = item.categoryId?._id || item.categoryId || "";
      const matchesCategory =
        selectedCategory === "" ||
        itemCategoryId.toString() === selectedCategory.toString();

      const itemBrandId = item.brandId?._id || item.brandId || "";
      const matchesBrand =
        selectedBrand === "" ||
        itemBrandId.toString() === selectedBrand.toString();

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [
    products,
    search,
    selectedCategory,
    selectedBrand,
  ]);

  const visibleProducts = useMemo(() => {
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
          }, 450);
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
    setSelectedBrand("");
  };

  return (
    <div className="flex-grow w-full bg-soft-bg/30 py-12">

      {/* Heading & Search Box */}
      <div className="text-center mb-10 px-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-dark-navy tracking-tight relative pb-3 w-fit mx-auto">
          All Products
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"></span>
        </h1>
        <p className="text-muted-gray mt-3 text-xs sm:text-sm font-medium">
          Find your favourite premium tech gadgets and setups
        </p>

        {/* Enhanced Search Input */}
        <div className="flex justify-center mt-8">
          <div className="relative w-full max-w-2xl">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-gray/80">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by product name, category, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-light-border bg-white shadow-2xs hover:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-dark-navy font-medium placeholder-muted-gray/50 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-gray hover:text-dark-navy cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Action Panel (Mobile only) */}
      <div className="block lg:hidden px-6 mb-6">
        <div className="flex justify-between items-center bg-white p-4 border border-light-border/60 rounded-3xl shadow-2xs">
          <span className="text-xs font-extrabold text-dark-navy uppercase tracking-wider">
            Products ({filteredProducts.length})
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border font-bold text-xs transition-all cursor-pointer outline-none ${
                mobileFiltersOpen
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-white text-muted-gray border-light-border hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal size={13} />
              Filters {selectedCategory || selectedBrand ? "•" : ""}
            </button>
            {(selectedCategory || selectedBrand || search) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-red-500 font-bold text-xs hover:text-red-655 transition cursor-pointer"
              >
                <RotateCcw size={11} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filters Drawer Panel */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            mobileFiltersOpen
              ? "max-h-[500px] mt-3 border border-light-border/60 p-5 rounded-3xl bg-white shadow-xs"
              : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-5">
            {/* Categories Mobile */}
            <div>
              <h3 className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest mb-3">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="h-7 w-16 bg-slate-100 rounded-xl animate-pulse"></div>
                  ))
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setSelectedCategory("");
                        setSelectedBrand("");
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedCategory === ""
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-slate-50 text-muted-gray border-light-border/40 hover:bg-slate-100"
                      }`}
                    >
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category._id}
                        onClick={() => {
                          setSelectedCategory(category._id);
                          setSelectedBrand("");
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedCategory === category._id
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-slate-50 text-muted-gray border-light-border/40 hover:bg-slate-100"
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
              <h3 className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest mb-3">
                Brands
              </h3>
              <div className="flex flex-wrap gap-2">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="h-7 w-16 bg-slate-100 rounded-xl animate-pulse"></div>
                  ))
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedBrand("")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedBrand === ""
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-slate-50 text-muted-gray border-light-border/40 hover:bg-slate-100"
                      }`}
                    >
                      All Brands
                    </button>
                    {brands
                      .filter(
                        (brand) =>
                          selectedCategory === "" ||
                          (brand.categoryId?._id || brand.categoryId) === selectedCategory
                      )
                      .map((brand) => (
                        <button
                          key={brand._id}
                          onClick={() => setSelectedBrand(brand._id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            selectedBrand === brand._id
                              ? "bg-primary text-white border-primary shadow-xs"
                              : "bg-slate-50 text-muted-gray border-light-border/40 hover:bg-slate-100"
                          }`}
                        >
                          {brand.name}
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
      <div className="px-6 sm:px-12 lg:px-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-3xl border border-light-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.005)] p-6 h-fit sticky top-24">
              
              {/* Sidebar Header */}
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-light-border/60">
                <h2 className="text-base font-bold text-dark-navy flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-primary" />
                  Filters
                </h2>
                {(selectedCategory || selectedBrand || search) && (
                  <button
                    onClick={clearFilters}
                    className="text-red-500 text-xs font-bold hover:text-red-655 transition flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    Reset
                  </button>
                )}
              </div>

              {/* Categories Sidebar Section */}
              <div className="mb-8">
                <h3 className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest mb-4">
                  Categories
                </h3>
                <div className="flex flex-col gap-1.5">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="h-9.5 bg-slate-150 rounded-xl animate-pulse"></div>
                    ))
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setSelectedCategory("");
                          setSelectedBrand("");
                        }}
                        className={`px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all border-l-2 cursor-pointer ${
                          selectedCategory === ""
                            ? "bg-primary/5 border-primary text-primary"
                            : "border-transparent text-muted-gray hover:bg-slate-50 hover:text-dark-navy"
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category._id}
                          onClick={() => {
                            setSelectedCategory(category._id);
                            setSelectedBrand("");
                          }}
                          className={`px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all border-l-2 cursor-pointer ${
                            selectedCategory === category._id
                              ? "bg-primary/5 border-primary text-primary"
                              : "border-transparent text-muted-gray hover:bg-slate-50 hover:text-dark-navy"
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
                <h3 className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest mb-4">
                  Brands
                </h3>
                <div className="flex flex-wrap gap-2">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className="h-8 w-16 bg-slate-100 rounded-xl animate-pulse"></div>
                    ))
                  ) : (
                    <>
                      <button
                        onClick={() => setSelectedBrand("")}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedBrand === ""
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-white text-muted-gray border-light-border hover:bg-slate-50 hover:border-light-border"
                        }`}
                      >
                        All Brands
                      </button>
                      {brands
                        .filter(
                          (brand) =>
                            selectedCategory === "" ||
                            (brand.categoryId?._id || brand.categoryId) === selectedCategory
                        )
                        .map((brand) => (
                          <button
                            key={brand._id}
                            onClick={() => setSelectedBrand(brand._id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              selectedBrand === brand._id
                                ? "bg-primary text-white border-primary shadow-xs"
                                : "bg-white text-muted-gray border-light-border hover:bg-slate-50 hover:border-light-border"
                            }`}
                          >
                            {brand.name}
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
              <h2 className="font-extrabold text-base text-dark-navy hidden lg:block uppercase tracking-wider">
                Products found ({filteredProducts.length})
              </h2>
            </div>

            {loading ? (
              <ProductSkeleton />
            ) : visibleProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-light-border/60 shadow-2xs p-12 text-center">
                <h2 className="text-xl font-extrabold text-dark-navy">
                  No Products Found
                </h2>
                <p className="text-xs text-muted-gray mt-2 font-medium">
                  Try adjusting your search criteria or clearing filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold text-xs transition shadow-md hover:shadow-lg cursor-pointer active:scale-95"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
                        <Loader2 className="animate-spin text-primary w-8 h-8" />
                        <p className="text-muted-gray text-xs font-semibold animate-pulse">Loading more premium products...</p>
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
