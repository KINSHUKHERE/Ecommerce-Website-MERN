import React, { useEffect, useState, useMemo } from "react";
import { getVendorReviewsApi } from "../../api/ReviewApi";
import {
  Star,
  Search,
  Loader2,
  SlidersHorizontal,
  MessageSquare,
  ExternalLink,
  Smile,
  Frown,
  Meh
} from "lucide-react";
import { Link } from "react-router-dom";
import { getVendorsApi } from "../../api/AuthApi";

const ProductReviews = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const routePrefix = user.role === "vendor" ? "/vendor" : "/admin";

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState("All");
  const [vendorsList, setVendorsList] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");

  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => setMessage(""), 2500);
  };

  useEffect(() => {
    if (user.role === "admin") {
      fetchVendors();
    } else {
      fetchReviews();
    }
  }, []);

  useEffect(() => {
    if (user.role === "admin" && selectedVendorId) {
      fetchReviews(selectedVendorId);
    }
  }, [selectedVendorId]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await getVendorsApi();
      const list = res.data.vendors || [];
      setVendorsList(list);
      if (list.length > 0) {
        setSelectedVendorId(list[0]._id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
      showToast("Failed to load vendors list", "error");
      setLoading(false);
    }
  };

  const fetchReviews = async (vId = "") => {
    setLoading(true);
    try {
      const res = await getVendorReviewsApi(vId);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch product reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  // Math summary metrics
  const metrics = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, count: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const count = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = (sum / count).toFixed(1);

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rounded = Math.round(r.rating);
      if (breakdown[rounded] !== undefined) {
        breakdown[rounded]++;
      }
    });

    return { avg, count, ...breakdown };
  }, [reviews]);

  // Filtering logic
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      const matchesSearch =
        (rev.productId?.heading || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rev.comment || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rev.userName || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStars = starFilter === "All" || Number(rev.rating) === Number(starFilter);
      
      return matchesSearch && matchesStars;
    });
  }, [reviews, searchQuery, starFilter]);

  return (
    <div className="w-full min-h-screen bg-soft-bg/30 p-4 sm:p-6 text-dark-navy antialiased">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-navy tracking-tight leading-normal text-left">
              Customer Product Reviews
            </h1>
            <p className="text-xs text-muted-gray mt-1 font-semibold text-left">
              Monitor and inspect ratings and text feedback submitted by verified buyers of your store's products.
            </p>
          </div>
        </div>

        {user.role === "admin" && (
          <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs flex flex-col sm:flex-row gap-4 items-center justify-between text-left">
            <div className="w-full sm:w-auto">
              <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest block mb-0.5">
                Super Admin Controls
              </span>
              <h4 className="text-sm font-extrabold text-dark-navy">Select a vendor profile to inspect reviews</h4>
            </div>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full sm:w-72 px-3.5 py-2.5 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-bold text-dark-navy bg-white transition-all h-[38px] cursor-pointer"
            >
              <option value="">Select a Vendor...</option>
              {vendorsList.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.businessName || v.name} ({v.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white border border-light-border/60 rounded-3xl shadow-2xs">
            <Loader2 className="animate-spin text-primary w-8 h-8 mb-3" />
            <span className="text-xs text-muted-gray font-semibold uppercase tracking-wider animate-pulse">
              Fetching Store Reviews...
            </span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center bg-white border border-light-border/60 rounded-3xl shadow-2xs px-6 flex flex-col items-center">
            <MessageSquare size={42} className="text-muted-gray/50 mb-4" strokeWidth={2.5} />
            <h3 className="text-base font-extrabold text-dark-navy">No Reviews Yet</h3>
            <p className="text-xs text-muted-gray mt-1.5 max-w-xs leading-relaxed font-semibold">
              When customers purchase your items and leave feedback, their ratings and comments will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* KPI Summary Block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Avg Rating Card */}
              <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xs flex items-center justify-between relative overflow-hidden">
                <div className="space-y-1.5 z-10 text-left">
                  <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest block leading-none">
                    Average Rating
                  </span>
                  <span className="text-4xl font-black text-dark-navy block">
                    {metrics.avg} <span className="text-lg font-bold text-muted-gray">/ 5.0</span>
                  </span>
                  <div className="flex text-amber-500 gap-0.5 text-xs">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= Math.round(Number(metrics.avg)) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-5xl opacity-10 flex items-center select-none font-bold">
                  ⭐
                </div>
              </div>

              {/* Total Reviews Card */}
              <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xs flex items-center justify-between relative overflow-hidden">
                <div className="space-y-1.5 z-10 text-left">
                  <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest block leading-none">
                    Total Reviews
                  </span>
                  <span className="text-4xl font-black text-dark-navy block">
                    {metrics.count}
                  </span>
                  <span className="text-xs font-semibold text-muted-gray block">
                    Across all store items
                  </span>
                </div>
                <div className="text-5xl opacity-10 flex items-center select-none font-bold">
                  💬
                </div>
              </div>

              {/* Sentiment Summary Card */}
              <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xs flex items-center justify-between relative overflow-hidden">
                <div className="space-y-1.5 z-10 text-left w-full">
                  <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest block leading-none">
                    Rating Breakdown
                  </span>
                  <div className="space-y-1 mt-2.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = metrics[star] || 0;
                      const pct = metrics.count > 0 ? (count / metrics.count) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-[10px] font-bold text-muted-gray">
                          <span className="w-10 text-right">{star} Star</span>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="w-6 text-left">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Filter controls */}
            <div className="bg-white border border-light-border/60 rounded-3xl p-4 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative w-full md:max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-gray/80" />
                <input
                  type="text"
                  placeholder="Search products, buyers, or comments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all h-[38px] text-left"
                />
              </div>

              {/* Star selector filter */}
              <div className="flex gap-2 w-full md:w-auto items-center overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest flex items-center gap-1.5 mr-2 shrink-0">
                  <SlidersHorizontal size={12} />
                  Rating:
                </span>
                {["All", 5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStarFilter(star)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                      starFilter === star
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-slate-50 text-muted-gray border-light-border/40 hover:text-dark-navy hover:bg-slate-100"
                    }`}
                  >
                    {star === "All" ? "All Stars" : `${star} ★`}
                  </button>
                ))}
              </div>

            </div>

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
              <div className="py-16 text-center bg-white border border-light-border/60 rounded-3xl shadow-2xs px-6">
                <SlidersHorizontal size={30} className="text-muted-gray/50 mx-auto mb-3" />
                <h3 className="text-sm font-extrabold text-dark-navy">No Matching Reviews</h3>
                <p className="text-xs text-muted-gray mt-1 font-semibold">
                  Adjust your search keyword or rating filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="bg-white border border-light-border/60 rounded-2xl p-3.5 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left hover:border-primary/50 transition-all duration-300"
                  >
                    {/* Left: Product Info */}
                    <div className="flex items-center gap-3 min-w-0 sm:w-1/3">
                      {rev.productId?.imgUrl && (
                        <img
                          src={rev.productId.imgUrl}
                          alt={rev.productId.heading}
                          className="w-10 h-10 object-contain bg-slate-50 border border-slate-100 rounded-xl p-0.5 flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <span className="text-[11px] font-extrabold text-dark-navy block truncate">
                          {rev.productId?.heading || "Deleted Product"}
                        </span>
                        <span className="text-[9px] text-muted-gray font-semibold block mt-0.5">
                          Buyer: {rev.userName || "Verified Buyer"} ({rev.userId?.email || "N/A"})
                        </span>
                      </div>
                    </div>

                    {/* Center: Star Rating & Comment Text */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-500 gap-0.5 text-[11px]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star}>
                              {star <= rev.rating ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                        <span className="text-[9px] font-black text-dark-navy">({rev.rating}/5)</span>
                        <span className="text-[9px] text-muted-gray font-semibold">
                          Submitted: {new Date(rev.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-gray/90 font-semibold line-clamp-1 italic">
                        "{rev.comment}"
                      </p>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-end gap-3 flex-shrink-0">
                      {rev.productId?._id && (
                        <Link
                          to={`${routePrefix}/products/${rev.productId._id}`}
                          className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-dark-navy text-[10px] font-black uppercase tracking-wider rounded-xl border border-light-border/40 cursor-pointer transition flex items-center gap-1.5"
                        >
                          <span>View Detail</span>
                          <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>

      {/* Toast Alert Widget */}
      {message && (
        <div className="fixed bottom-5 right-5 z-50 bg-dark-navy border border-light-border/10 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn max-w-[90vw] w-max">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0"></span>
          {message}
        </div>
      )}

    </div>
  );
};

export default ProductReviews;
