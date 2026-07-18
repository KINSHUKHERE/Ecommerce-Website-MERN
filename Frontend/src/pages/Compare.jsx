import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProduct } from "../api/ProductApi";
import { sentToCart } from "../api/CartApi";
import {
  Scale,
  ArrowLeft,
  X,
  Check,
  ShoppingBag,
  Loader2
} from "lucide-react";

// dynamic specs helper
const getSpecs = (product) => {
  const heading = (product.heading || product.name || "").toLowerCase();
  const cat = (product.categoryId?.name || "").toLowerCase();

  // Helper patterns
  const ramMatch = heading.match(/(\d+)\s*gb\s*ram/i) || heading.match(/(\d+)\s*gb\/\d+/i);
  const storageMatch = heading.match(/(\d+)\s*(?:gb|tb)\s*(?:storage|rom)?/i) || heading.match(/\/\s*(\d+)\s*gb/i);
  
  const ram = ramMatch ? `${ramMatch[1]}GB RAM` : null;
  const storage = storageMatch ? `${storageMatch[0].toUpperCase().replace(/\s+/g, "")}` : null;

  if (cat.includes("audio") || cat.includes("sound") || cat.includes("speaker") || cat.includes("headphone") || heading.includes("ear") || heading.includes("headphone")) {
    const hasBluetooth = heading.includes("wireless") || heading.includes("bluetooth") || heading.includes("buds");
    const audioTech = heading.includes("bass") ? "Enhanced Bass Surround" : "Hi-Res Stereo Sound";
    const noise = heading.includes("anc") || heading.includes("noise") ? "Active Noise Cancelling (ANC)" : "Passive Noise Isolation";
    const battery = heading.includes("anc") ? "Up to 24 Hours with Case" : "Up to 35 Hours Playtime";
    
    return {
      "Connectivity": hasBluetooth ? "Bluetooth 5.3 Wireless" : "Wired 3.5mm Jack",
      "Audio Technology": audioTech,
      "Noise Isolation": noise,
      "Battery Performance": battery,
    };
  }

  if (cat.includes("mobile") || cat.includes("phone") || heading.includes("phone") || heading.includes("iphone") || heading.includes("galaxy")) {
    let display = "6.5-inch FHD+ Screen";
    if (heading.includes("iphone")) {
      display = heading.includes("pro max") ? "6.9-inch Super Retina XDR OLED" : (heading.includes("plus") ? "6.7-inch Super Retina XDR OLED" : "6.3-inch Super Retina XDR OLED");
    } else if (heading.includes("samsung")) {
      display = heading.includes("ultra") ? "6.8-inch Dynamic AMOLED 2X" : "6.6-inch Dynamic AMOLED 2X";
    } else {
      const sizeMatch = heading.match(/(\d+\.\d+)\s*-?inch/i);
      if (sizeMatch) {
        display = `${sizeMatch[1]}-inch AMOLED Panel`;
      } else if (heading.includes("power")) {
        display = "6.7-inch Full HD+ Display";
      }
    }

    let chip = "Octa-Core Processor";
    if (heading.includes("iphone 17")) {
      chip = "Apple A19 Bionic Hexa-Core";
    } else if (heading.includes("iphone 16")) {
      chip = "Apple A18 Bionic Hexa-Core";
    } else if (heading.includes("iphone")) {
      chip = "Apple A-Series Hexa-Core";
    } else if (heading.includes("samsung") || heading.includes("ultra")) {
      chip = "Snapdragon 8 Gen 3 Mobile Platform";
    } else if (heading.includes("realme") || heading.includes("p4")) {
      chip = "MediaTek Dimensity 7050 Octa-Core";
    }

    let camera = "50 MP Dual Camera";
    if (heading.includes("iphone") || heading.includes("pro")) {
      camera = "48MP + 12MP + 12MP Pro Triple Camera";
    } else if (heading.includes("ultra")) {
      camera = "200MP + 50MP + 12MP + 10MP Quad Camera";
    } else if (heading.includes("realme") || heading.includes("power")) {
      camera = "50 MP AI Primary + 2 MP Portrait Camera";
    }

    let battery = "5000 mAh High Capacity";
    if (heading.includes("iphone")) {
      battery = "Built-in Lithium-ion, 25W Fast Charge";
    } else if (heading.includes("power")) {
      battery = "6000 mAh Battery with 45W SUPERVOOC";
    }

    // Include dynamic RAM/Storage spec info
    const memory = [ram, storage].filter(Boolean).join(" + ");

    return {
      "Connectivity": heading.includes("5g") ? "5G / Dual 4G VoLTE / Wi-Fi 6" : "4G VoLTE / Wi-Fi 5",
      "Display Size": display,
      "Processor Chip": chip,
      "Camera Quality": camera,
      "Battery Performance": battery,
      "Memory Specifications": memory || "N/A"
    };
  }

  return {
    "Connectivity": "Plug and Play USB-C",
    "Display Size": "Universal OS Compatibility",
    "Processor Chip": "Ergonomic Performance Layout",
    "Battery Performance": "USB Direct Bus Powered",
  };
};

const Compare = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareIds, setCompareIds] = useState([]);
  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false);
  const [toast, setToast] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const loadCompareData = async () => {
    try {
      const cached = localStorage.getItem("yocart_compare_ids");
      const ids = cached ? JSON.parse(cached) : [];
      setCompareIds(ids);

      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const res = await getProduct(null, false, ids.join(","));
      const allData = res.data.data || [];
      // Preserve local compare order
      const ordered = ids
        .map(id => allData.find(p => p._id === id))
        .filter(Boolean);
      setProducts(ordered);
    } catch (err) {
      console.error("Compare loading error:", err);
      setToast("Failed to load products for comparison");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompareData();
    window.addEventListener("compareUpdated", loadCompareData);
    return () => {
      window.removeEventListener("compareUpdated", loadCompareData);
    };
  }, []);

  const handleRemoveProduct = (id) => {
    const updated = compareIds.filter(x => x !== id);
    localStorage.setItem("yocart_compare_ids", JSON.stringify(updated));
    window.dispatchEvent(new Event("compareUpdated"));
  };

  const handleAddToCart = async (product) => {
    if (product.options && product.options.length > 0) {
      navigate(`/products/${product._id}`);
      return;
    }

    try {
      if (!user) {
        navigate("/login");
        return;
      }

      const cartData = {
        userId: user._id,
        productId: product._id,
        quantity: 1,
      };

      await sentToCart(cartData);
      window.dispatchEvent(new Event("cartUpdated"));
      setToast(`"${product.heading}" added to cart!`);
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      const errMsg = err.response?.data?.msg || "Unable to add to cart";
      setToast(errMsg);
      setTimeout(() => setToast(""), 3000);
    }
  };

  const getProductPrice = (p) => {
    // Check if sale active
    const hasGlobalSale = () => {
      try {
        const cached = sessionStorage.getItem("globalSaleConfig");
        return cached ? JSON.parse(cached).isGlobalSaleActive : false;
      } catch {
        return false;
      }
    };

    if (p.variants && p.variants.length > 0) {
      const prices = p.variants.map(v => {
        const onSale = hasGlobalSale() && v.onSale && v.salePrice > 0;
        return onSale ? v.salePrice : v.price;
      });
      prices.sort((a, b) => a - b);
      return prices[0] || 0;
    }
    const onSale = hasGlobalSale() && p.onSale && p.salePrice > 0;
    return onSale ? p.salePrice : (p.price || 0);
  };

  const getProductStock = (p) => {
    if (p.variants && p.variants.length > 0) {
      return p.variants.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    }
    return p.quantity ?? 0;
  };

  // Best Value Calculations
  const pricesList = products.map(p => getProductPrice(p));
  const minPrice = pricesList.length > 1 ? Math.min(...pricesList) : null;

  const ratingsList = products.map(p => Number(p.rating?.avgRating || 0));
  const maxRating = ratingsList.length > 1 ? Math.max(...ratingsList) : null;

  // Comparison row mapping
  const compareRows = [
    {
      key: "brand",
      label: "Brand",
      getValue: p => p.brandId?.name || "Generic",
    },
    {
      key: "category",
      label: "Category",
      getValue: p => p.categoryId?.name || "Uncategorized",
    },
    {
      key: "price",
      label: "Price",
      getValue: p => `₹${getProductPrice(p).toLocaleString("en-IN")}`,
      renderCustom: (p) => {
        const price = getProductPrice(p);
        const isBest = minPrice !== null && price === minPrice;
        return (
          <div className="flex flex-col gap-1 items-center">
            <span className="font-extrabold text-[13px] text-dark-navy">
              ₹{price.toLocaleString("en-IN")}
            </span>
            {isBest && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-650 border border-emerald-100">
                <Check size={8} className="stroke-[3]" /> Best Price
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: "rating",
      label: "Rating",
      getValue: p => p.rating?.avgRating ? `${p.rating.avgRating} ★ (${p.rating.count} reviews)` : "No ratings yet",
      renderCustom: (p) => {
        const rating = Number(p.rating?.avgRating || 0);
        const count = p.rating?.count || 0;
        const isBest = maxRating !== null && rating === maxRating && rating > 0;
        return (
          <div className="flex flex-col gap-1 items-center">
            {count > 0 ? (
              <div className="flex items-center gap-0.5 text-amber-500 font-extrabold text-[11px]">
                <span>★</span>
                <span className="text-dark-navy font-black">{rating}</span>
                <span className="text-muted-gray font-semibold">({count})</span>
              </div>
            ) : (
              <span className="text-[10px] text-muted-gray font-bold">No reviews</span>
            )}
            {isBest && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-650 border border-indigo-100">
                <Check size={8} className="stroke-[3]" /> Top Rated
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: "stock",
      label: "Stock Level",
      getValue: p => {
        const stock = getProductStock(p);
        return stock > 0 ? `${stock} units left` : "Out of Stock";
      }
    },
    {
      key: "availability",
      label: "Availability",
      getValue: p => getProductStock(p) > 0 ? "In Stock" : "Out of Stock",
      renderCustom: (p) => {
        const inStock = getProductStock(p) > 0;
        return (
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
            inStock ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
          }`}>
            {inStock ? "In Stock" : "Sold Out"}
          </span>
        );
      }
    },
    {
      key: "warranty",
      label: "Warranty Period",
      getValue: p => {
        const cat = (p.categoryId?.name || "").toLowerCase();
        return cat.includes("audio") || cat.includes("phone") ? "2 Years Brand Warranty" : "1 Year Manufacturer Warranty";
      }
    },
    {
      key: "return",
      label: "Return Policy",
      getValue: p => getProductPrice(p) > 10000 ? "10 Days Replacement Only" : "7 Days Return & Refund Available",
    },
    {
      key: "variants",
      label: "Product Options",
      getValue: p => {
        if (p.variants && p.variants.length > 0) {
          const values = [];
          p.variants.forEach(v => {
            if (v.size) values.push(v.size);
            if (v.color) values.push(v.color);
          });
          const unique = Array.from(new Set(values));
          return unique.length > 0 ? unique.join(" / ") : "Standard Edition";
        }
        return "Standard Edition";
      }
    },
    // Specs injection
    {
      key: "spec_connectivity",
      label: "Connectivity",
      getValue: p => getSpecs(p)["Connectivity"] || "Standard",
    },
    {
      key: "spec_display",
      label: "Display / Audio Tech",
      getValue: p => getSpecs(p)["Display Size"] || getSpecs(p)["Audio Technology"] || "N/A",
    },
    {
      key: "spec_processor",
      label: "Processor / Hardware",
      getValue: p => getSpecs(p)["Processor Chip"] || getSpecs(p)["Noise Isolation"] || "N/A",
    },
    {
      key: "spec_camera",
      label: "Camera Quality",
      getValue: p => getSpecs(p)["Camera Quality"] || "N/A",
    },
    {
      key: "spec_battery",
      label: "Battery Performance",
      getValue: p => getSpecs(p)["Battery Performance"] || "N/A",
    },
    {
      key: "spec_memory",
      label: "Memory & Storage",
      getValue: p => getSpecs(p)["Memory Specifications"] || "N/A",
    }
  ];

  // Helper to identify if row is identical across all compared products
  const isRowIdentical = (row) => {
    if (products.length <= 1) return true;
    const firstVal = row.getValue(products[0]);
    return products.every(p => row.getValue(p) === firstVal);
  };

  const filteredRows = compareRows.filter(row => {
    const allN_A = products.every(p => {
      const val = row.getValue(p);
      return val === "N_A" || val === "N/A" || val === "" || val === undefined;
    });
    if (allN_A) return false;

    if (showOnlyDiffs) {
      return !isRowIdentical(row);
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 min-h-screen text-left">
      {/* Header breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-light-border bg-white text-muted-gray hover:text-dark-navy hover:bg-slate-50 transition cursor-pointer outline-none focus:outline-none"
            aria-label="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-dark-navy uppercase tracking-tight flex items-center gap-2">
              <Scale className="text-primary animate-pulse" size={24} /> Compare Products
            </h1>
            <p className="text-[11px] font-bold text-muted-gray uppercase tracking-widest mt-1">
              Compare prices, specs, and details side-by-side
            </p>
          </div>
        </div>

        {/* Toggle option */}
        {products.length > 1 && (
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-light-border/80 rounded-xl shadow-2xs hover:bg-slate-50 cursor-pointer select-none transition">
            <input
              type="checkbox"
              checked={showOnlyDiffs}
              onChange={(e) => setShowOnlyDiffs(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
            />
            <span className="text-xs font-bold text-dark-navy uppercase tracking-wider">
              Show Only Differences
            </span>
          </label>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-light-border/40 shadow-xs">
          <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
          <span className="text-xs font-extrabold text-muted-gray uppercase tracking-widest animate-pulse">
            Loading specifications...
          </span>
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-white border border-dashed border-light-border/80 rounded-3xl space-y-5">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-muted-gray/50 border border-light-border/30">
            <Scale size={28} />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base sm:text-lg font-black text-dark-navy uppercase tracking-tight">
              Your Comparison List is Empty
            </h3>
            <p className="text-xs text-muted-gray leading-relaxed font-semibold">
              Go back to our catalog and click the compare icon on your favorite products to see comparison data.
            </p>
          </div>
          <Link
            to="/products"
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition shadow-md active:scale-95 outline-none"
          >
            <ShoppingBag size={14} />
            Browse Products
          </Link>
        </div>
      ) : (
        /* Comparison Table Matrix */
        <div className="bg-white border border-light-border/45 rounded-3xl shadow-xs overflow-hidden">
          {/* Scrollable Container */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse table-fixed min-w-[700px]">
              
              {/* Sticky Top Header Column titles */}
              <thead className="sticky top-0 z-20 bg-white shadow-xs border-b border-light-border/60">
                <tr>
                  <th className="w-48 bg-slate-50/50 p-4 border-r border-light-border/40 select-none">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Overview</span>
                      <span className="text-[12px] font-bold text-muted-gray">
                        {products.length} {products.length === 1 ? "Product" : "Products"} Comparing
                      </span>
                    </div>
                  </th>
                  {products.map((p) => {
                    const price = getProductPrice(p);
                    const stock = getProductStock(p);
                    return (
                      <th key={p._id} className="p-4 border-r border-light-border/40 text-center relative align-top min-w-[180px]">
                        {/* Remove Action */}
                        <button
                          onClick={() => handleRemoveProduct(p._id)}
                          className="absolute top-3 right-3 p-1 rounded-lg text-muted-gray/55 hover:text-red-500 hover:bg-slate-100 transition cursor-pointer outline-none focus:outline-none"
                          title="Remove from comparison"
                          aria-label={`Remove ${p.heading}`}
                        >
                          <X size={14} />
                        </button>

                        <div className="flex flex-col items-center text-center gap-3">
                          <div className="w-20 h-20 bg-slate-50 rounded-2xl p-2 flex items-center justify-center border border-light-border/30">
                            <img
                              src={p.imgUrl}
                              alt={p.heading}
                              className="max-h-full max-w-full object-contain mix-blend-multiply"
                            />
                          </div>
                          <div className="space-y-1 w-full px-2">
                            <h4 className="text-xs font-black text-dark-navy leading-snug line-clamp-2 min-h-[32px]">
                              {p.heading}
                            </h4>
                            <p className="text-xs font-extrabold text-primary">
                              ₹{price.toLocaleString("en-IN")}
                            </p>
                          </div>

                          <button
                            onClick={() => handleAddToCart(p)}
                            disabled={stock <= 0}
                            className={`w-full py-2 px-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 outline-none ${
                              stock <= 0
                                ? "bg-slate-100 text-slate-350 cursor-not-allowed border border-light-border/50"
                                : "bg-accent-light text-primary hover:bg-primary hover:text-white cursor-pointer"
                            }`}
                          >
                            <ShoppingBag size={11} />
                            <span>Add To Cart</span>
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Matrix Specifications Body */}
              <tbody className="divide-y divide-light-border/30">
                {filteredRows.map((row) => {
                  const isIdentical = isRowIdentical(row);
                  return (
                    <tr
                      key={row.key}
                      className={`transition-colors duration-200 ${
                        !isIdentical ? "bg-primary/5/5" : ""
                      }`}
                    >
                      {/* Feature Label Column */}
                      <td className="p-4 border-r border-light-border/40 font-black text-[10px] uppercase tracking-wider text-muted-gray bg-slate-50/20 select-none">
                        {row.label}
                      </td>

                      {/* Values Columns */}
                      {products.map((p) => (
                        <td
                          key={p._id}
                          className="p-4 border-r border-light-border/40 text-center text-xs font-semibold text-dark-navy"
                        >
                          {row.renderCustom ? row.renderCustom(p) : row.getValue(p)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating toast notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-dark-navy border border-light-border/10 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn max-w-[95%]">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0"></span>
          {toast}
        </div>
      )}
    </div>
  );
};

export default Compare;
