import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Scale, Trash2, ArrowRight } from "lucide-react";

const CompareFloatingBar = () => {
  const location = useLocation();
  const [compareCount, setCompareCount] = useState(0);

  const checkCompareCount = () => {
    try {
      const cached = localStorage.getItem("yocart_compare_ids");
      if (cached) {
        setCompareCount(JSON.parse(cached).length);
      } else {
        setCompareCount(0);
      }
    } catch {
      setCompareCount(0);
    }
  };

  useEffect(() => {
    checkCompareCount();
    window.addEventListener("compareUpdated", checkCompareCount);
    return () => {
      window.removeEventListener("compareUpdated", checkCompareCount);
    };
  }, []);

  const handleClearAll = (e) => {
    e.preventDefault();
    localStorage.removeItem("yocart_compare_ids");
    window.dispatchEvent(new Event("compareUpdated"));
  };

  if (compareCount === 0 || location.pathname === "/compare") return null;

  return (
    <div className="fixed bottom-22 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-lg bg-dark-navy/95 backdrop-blur-md text-white py-3 px-5 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/10 animate-fadeIn">
      <div className="flex items-center gap-2 select-none">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
          <Scale size={15} className="animate-pulse" />
        </div>
        <div className="text-left">
          <span className="block text-[11px] font-black uppercase tracking-wider text-slate-300">Product Comparison</span>
          <span className="text-[12px] font-bold">
            {compareCount} {compareCount === 1 ? "Product" : "Products"} Selected
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleClearAll}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition cursor-pointer text-xs flex items-center gap-1 font-bold uppercase tracking-wider outline-none focus:outline-none"
          title="Clear all selections"
        >
          <Trash2 size={13} />
          <span className="hidden sm:inline">Clear</span>
        </button>

        <Link
          to="/compare"
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 transition shadow-md active:scale-95 outline-none"
        >
          <span>Compare Now</span>
          <ArrowRight size={12} className="stroke-[2.5]" />
        </Link>
      </div>
    </div>
  );
};

export default CompareFloatingBar;
