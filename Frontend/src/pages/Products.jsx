import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, RotateCcw, Loader2, ArrowUpDown, ChevronDown } from "lucide-react";
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
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedRating, setSelectedRating] = useState("");

  // Show more/less states for categories and brands
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [brandsExpanded, setBrandsExpanded] = useState(true);
  const [ratingExpanded, setRatingExpanded] = useState(true);

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
    const vId = searchParams.get("vendorId");
    if (vId) {
      setSelectedVendor(vId);
    } else {
      setSelectedVendor("");
    }
  }, [searchParams]);

  // Reset visibleCount when any filter/search changes
  useEffect(() => {
    setVisibleCount(10);
  }, [search, selectedCategory, selectedBrand, selectedVendor, selectedRating]);

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

  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      if (selectedCategory === "") return true;
      const brandCatId = brand.categoryId?._id || brand.categoryId;
      return brandCatId && brandCatId.toString() === selectedCategory.toString();
    });
  }, [brands, selectedCategory]);

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

      const itemVendorId = item.vendorId?._id || item.vendorId || null;
      const matchesVendor =
        selectedVendor === "" ||
        (selectedVendor === "admin"
          ? !itemVendorId
          : itemVendorId && itemVendorId.toString() === selectedVendor.toString());

      const itemRating = item.rating?.avgRating || 0;
      const matchesRating =
        selectedRating === "" ||
        Number(itemRating) >= Number(selectedRating);

      return matchesSearch && matchesCategory && matchesBrand && matchesVendor && matchesRating;
    });
  }, [
    products,
    search,
    selectedCategory,
    selectedBrand,
    selectedVendor,
    selectedRating,
  ]);

  const sortedAndFilteredProducts = useMemo(() => {
    let result = [...filteredProducts];
    
    const getMinPrice = (product) => {
      if (product.variants && product.variants.length > 0) {
        const prices = product.variants.map((v) => v.price).filter((p) => typeof p === "number");
        if (prices.length > 0) {
          return Math.min(...prices);
        }
      }
      return product.price || 0;
    };

    if (sortBy === "price-asc") {
      result.sort((a, b) => getMinPrice(a) - getMinPrice(b));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => getMinPrice(b) - getMinPrice(a));
    }
    return result;
  }, [filteredProducts, sortBy]);

  const visibleProducts = useMemo(() => {
    return sortedAndFilteredProducts.slice(0, visibleCount);
  }, [sortedAndFilteredProducts, visibleCount]);

  // Observer to load more items when scrolling to the bottom
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          visibleCount < sortedAndFilteredProducts.length &&
          !scrollingLoading
        ) {
          setScrollingLoading(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 10, sortedAndFilteredProducts.length));
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
  }, [sortedAndFilteredProducts.length, visibleCount, scrollingLoading, loading]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedRating("");
    setShowAllCategories(false);
    setShowAllBrands(false);
    setSortBy("default");
    setCategoriesExpanded(true);
    setBrandsExpanded(true);
    setRatingExpanded(true);
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
            Products ({sortedAndFilteredProducts.length})
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
              Filters {selectedCategory || selectedBrand || selectedRating ? "•" : ""}
            </button>
            {(selectedCategory || selectedBrand || search || selectedRating) && (
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
              ? "max-h-[1200px] mt-3 border border-light-border/60 p-5 rounded-3xl bg-white shadow-xs"
              : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-5">
            {/* Categories Mobile */}
            <div>
              <div 
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="flex justify-between items-center cursor-pointer mb-3 select-none group"
              >
                <h3 className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest group-hover:text-dark-navy transition-colors">
                  Categories
                </h3>
                <ChevronDown size={14} className={`text-muted-gray transition-transform duration-300 ${categoriesExpanded ? "rotate-180" : ""}`} />
              </div>
              
              <div className={`overflow-hidden transition-all duration-350 ${categoriesExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
                <div className="flex flex-wrap gap-2 pt-1 pb-2">
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
                      {(showAllCategories ? categories : categories.slice(0, 5)).map((category) => (
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
                {!loading && categories.length > 5 && (
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="text-[10px] font-extrabold text-primary hover:text-accent mt-1 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {showAllCategories ? "Show Less" : `Show More (+${categories.length - 5})`}
                  </button>
                )}
              </div>
            </div>

            {/* Brands Mobile */}
            <div>
              <div 
                onClick={() => setBrandsExpanded(!brandsExpanded)}
                className="flex justify-between items-center cursor-pointer mb-3 select-none group"
              >
                <h3 className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest group-hover:text-dark-navy transition-colors">
                  Brands
                </h3>
                <ChevronDown size={14} className={`text-muted-gray transition-transform duration-300 ${brandsExpanded ? "rotate-180" : ""}`} />
              </div>
              
              <div className={`overflow-hidden transition-all duration-350 ${brandsExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
                <div className="flex flex-wrap gap-2 pt-1 pb-2">
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
                      {(showAllBrands ? filteredBrands : filteredBrands.slice(0, 6)).map((brand) => (
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
                {!loading && filteredBrands.length > 6 && (
                  <button
                    onClick={() => setShowAllBrands(!showAllBrands)}
                    className="text-[10px] font-extrabold text-primary hover:text-accent mt-1 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {showAllBrands ? "Show Less" : `Show More (+${filteredBrands.length - 6})`}
                  </button>
                )}
              </div>
            </div>

            {/* Rating Filter Mobile */}
            <div>
              <div
                onClick={() => setRatingExpanded(!ratingExpanded)}
                className="flex justify-between items-center cursor-pointer mb-3 select-none group"
              >
                <h3 className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest group-hover:text-dark-navy transition-colors">
                  Customer Rating
                </h3>
                <ChevronDown size={14} className={`text-muted-gray transition-transform duration-300 ${ratingExpanded ? "rotate-180" : ""}`} />
              </div>
              
              <div className={`overflow-hidden transition-all duration-350 ${ratingExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
                <div className="flex flex-wrap gap-2 pt-1 pb-2">
                  {[
                    { value: "", label: "All Ratings" },
                    { value: "4", label: "4★ & above" },
                    { value: "3", label: "3★ & above" },
                    { value: "2", label: "2★ & above" }
                  ].map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setSelectedRating(r.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                        selectedRating === r.value
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-slate-50 text-muted-gray border-light-border/40 hover:bg-slate-100"
                      }`}
                    >
                      <span>{r.label}</span>
                      {r.value !== "" && <span className="text-amber-500">★</span>}
                    </button>
                  ))}
                </div>
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
                {(selectedCategory || selectedBrand || search || selectedRating) && (
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
              <div className="mb-8 border-b border-light-border/40 pb-5">
                <div 
                  onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                  className="flex justify-between items-center cursor-pointer mb-4 select-none group"
                >
                  <h3 className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest group-hover:text-dark-navy transition-colors">
                    Categories
                  </h3>
                  <ChevronDown size={14} className={`text-muted-gray transition-transform duration-300 ${categoriesExpanded ? "rotate-180" : ""}`} />
                </div>
                
                <div className={`overflow-hidden transition-all duration-350 ${categoriesExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
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
                        {(showAllCategories ? categories : categories.slice(0, 5)).map((category) => (
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
                  {!loading && categories.length > 5 && (
                    <button
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="text-[10px] font-extrabold text-primary hover:text-accent mt-3 flex items-center gap-1 cursor-pointer transition-colors pl-4 w-full text-left"
                    >
                      {showAllCategories ? "Show Less" : `Show More (+${categories.length - 5})`}
                    </button>
                  )}
                </div>
              </div>

              {/* Brands Sidebar Section */}
              <div className="mb-2">
                <div 
                  onClick={() => setBrandsExpanded(!brandsExpanded)}
                  className="flex justify-between items-center cursor-pointer mb-4 select-none group"
                >
                  <h3 className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest group-hover:text-dark-navy transition-colors">
                    Brands
                  </h3>
                  <ChevronDown size={14} className={`text-muted-gray transition-transform duration-300 ${brandsExpanded ? "rotate-180" : ""}`} />
                </div>
                
                <div className={`overflow-hidden transition-all duration-350 ${brandsExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
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
                        {(showAllBrands ? filteredBrands : filteredBrands.slice(0, 6)).map((brand) => (
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
                  {!loading && filteredBrands.length > 6 && (
                    <button
                      onClick={() => setShowAllBrands(!showAllBrands)}
                      className="text-[10px] font-extrabold text-primary hover:text-accent mt-3 flex items-center gap-1 cursor-pointer transition-colors pl-1 w-full text-left"
                    >
                      {showAllBrands ? "Show Less" : `Show More (+${filteredBrands.length - 6})`}
                    </button>
                  )}
                </div>
              </div>

              {/* Rating Filter Section */}
              <div className="pt-5 mt-5 border-t border-light-border/40 text-left">
                <div
                  onClick={() => setRatingExpanded(!ratingExpanded)}
                  className="flex justify-between items-center cursor-pointer mb-3 select-none group"
                >
                  <h3 className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest group-hover:text-dark-navy transition-colors">
                    Customer Rating
                  </h3>
                  <ChevronDown size={14} className={`text-muted-gray transition-transform duration-300 ${ratingExpanded ? "rotate-180" : ""}`} />
                </div>
                
                <div className={`overflow-hidden transition-all duration-350 ${ratingExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: "", label: "All Ratings" },
                      { value: "4", label: "4★ & above" },
                      { value: "3", label: "3★ & above" },
                      { value: "2", label: "2★ & above" }
                    ].map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setSelectedRating(r.value)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                          selectedRating === r.value
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-slate-50 border-light-border/30 text-muted-gray hover:bg-slate-100 hover:text-dark-navy"
                        }`}
                      >
                        <span>{r.label}</span>
                        {r.value !== "" && <span className="text-amber-500">★</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Products Grid Content */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-extrabold text-base text-dark-navy hidden lg:block uppercase tracking-wider">
                Products found ({sortedAndFilteredProducts.length})
              </h2>
              
              <div className="relative z-25">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl border border-light-border bg-white text-xs font-bold text-dark-navy hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer outline-none h-[38px]"
                >
                  <ArrowUpDown size={14} className="text-muted-gray" />
                  <span>
                    Sort: {sortBy === "default" && "Default"}
                    {sortBy === "price-asc" && "Price: Low to High"}
                    {sortBy === "price-desc" && "Price: High to Low"}
                  </span>
                  <ChevronDown size={14} className={`text-muted-gray transition-transform duration-300 ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setSortOpen(false)}></div>
                    <div className="absolute left-0 lg:left-auto lg:right-0 top-full mt-2 w-56 rounded-2xl bg-white border border-light-border/60 shadow-md p-1.5 z-20 animate-scaleUp text-left">
                      {[
                        { key: "default", label: "Default / Newest", icon: ArrowUpDown, color: "text-primary bg-indigo-50/50" },
                        { key: "price-asc", label: "Price: Low to High", icon: ArrowUpDown, color: "text-emerald-500 bg-emerald-50/50" },
                        { key: "price-desc", label: "Price: High to Low", icon: ArrowUpDown, color: "text-rose-500 bg-rose-50/50" }
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = sortBy === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => {
                              setSortBy(item.key);
                              setSortOpen(false);
                            }}
                            className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all text-left ${
                              isSelected ? "bg-primary/5 text-primary font-black" : "text-muted-gray hover:bg-slate-50 hover:text-dark-navy"
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${item.color} transition-all duration-200 group-hover:scale-105`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold transition-colors">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
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
                {visibleCount < sortedAndFilteredProducts.length && (
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
