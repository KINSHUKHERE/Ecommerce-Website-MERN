import React, { useEffect, useState } from "react";
import { Sparkles, Flame, Percent, Check, Loader2, RefreshCw, AlertTriangle, ToggleLeft, ToggleRight, Settings2, Info, ChevronDown, Palette } from "lucide-react";
import { getGlobalSaleConfig, updateGlobalSaleConfig } from "../../api/SaleApi";
import { getProduct, updateProduct } from "../../api/ProductApi";

const SaleManagement = () => {
  const [user] = useState(() => JSON.parse(localStorage.getItem("user")) || {});
  const isAdmin = user.role === "admin";
  const isVendor = user.role === "vendor";

  // Global Config states
  const [globalSaleActive, setGlobalSaleActive] = useState(false);
  const [saleName, setSaleName] = useState("");
  const [saleTheme, setSaleTheme] = useState("normal");
  const [configLoading, setConfigLoading] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  // Vendor Specific States
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [savingProductId, setSavingProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Variant Modal States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVariants, setModalVariants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingVariants, setSavingVariants] = useState(false);

  // Fetch Global Config
  const fetchConfig = async () => {
    try {
      setConfigLoading(true);
      const res = await getGlobalSaleConfig();
      if (res.data && res.data.config) {
        setGlobalSaleActive(res.data.config.isGlobalSaleActive);
        setSaleName(res.data.config.saleName);
        setSaleTheme(res.data.config.saleTheme || "normal");
        sessionStorage.setItem("globalSaleConfig", JSON.stringify(res.data.config));
        window.dispatchEvent(new Event("saleConfigUpdated"));
      }
    } catch (err) {
      console.error("Failed to load sale config:", err);
    } finally {
      setConfigLoading(false);
    }
  };

  // Fetch Products (for vendors to manage pricing)
  const fetchProductsData = async () => {
    if (!isVendor) return;
    try {
      setProductsLoading(true);
      const res = await getProduct(user._id, true);
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Failed to load vendor products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchProductsData();
  }, []);

  // Admin Save Toggles
  const handleToggleGlobalSale = async () => {
    try {
      setConfigLoading(true);
      const nextActiveState = !globalSaleActive;
      const res = await updateGlobalSaleConfig({
        isGlobalSaleActive: nextActiveState,
        saleName: saleName,
        saleTheme: saleTheme
      });
      if (res.data && res.data.config) {
        setGlobalSaleActive(res.data.config.isGlobalSaleActive);
        setSaleName(res.data.config.saleName);
        setSaleTheme(res.data.config.saleTheme || "normal");
        sessionStorage.setItem("globalSaleConfig", JSON.stringify(res.data.config));
        window.dispatchEvent(new Event("saleConfigUpdated"));
      }
    } catch (err) {
      console.error("Failed to update global sale config:", err);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleSaveSaleName = async (e) => {
    e.preventDefault();
    if (!saleName.trim()) return;
    try {
      setConfigLoading(true);
      const res = await updateGlobalSaleConfig({
        isGlobalSaleActive: globalSaleActive,
        saleName: saleName.trim(),
        saleTheme: saleTheme
      });
      if (res.data && res.data.config) {
        setSaleName(res.data.config.saleName);
        setSaleTheme(res.data.config.saleTheme || "normal");
        sessionStorage.setItem("globalSaleConfig", JSON.stringify(res.data.config));
        window.dispatchEvent(new Event("saleConfigUpdated"));
        alert("Branding & Theme updated successfully!");
      }
    } catch (err) {
      console.error("Failed to update sale event name:", err);
    } finally {
      setConfigLoading(false);
    }
  };

  // Vendor Save Inline Product Changes
  const handleSaveFlatProductChanges = async (product) => {
    try {
      setSavingProductId(product._id);
      const payload = {
        onSale: product.onSale,
        salePrice: Number(product.salePrice) || 0
      };
      await updateProduct(product._id, payload);
      alert(`"${product.heading}" updated successfully!`);
    } catch (err) {
      console.error("Failed to update product sale settings:", err);
      alert("Error updating product settings. Please check constraints.");
    } finally {
      setSavingProductId(null);
    }
  };

  // Open variant editor modal
  const handleOpenVariantsModal = (product) => {
    setSelectedProduct(product);
    setModalVariants(
      (product.variants || []).map(v => ({
        ...v,
        onSale: v.onSale || false,
        salePrice: v.salePrice || 0
      }))
    );
    setIsModalOpen(true);
  };

  // Save variant pricing changes from modal
  const handleSaveVariantsChanges = async () => {
    if (!selectedProduct) return;
    try {
      setSavingVariants(true);
      const payload = {
        variants: modalVariants.map(v => ({
          _id: v._id,
          sku: v.sku,
          price: v.price,
          quantity: v.quantity,
          images: v.images,
          attributes: v.attributes,
          isActive: v.isActive,
          onSale: v.onSale,
          salePrice: Number(v.salePrice) || 0
        }))
      };
      await updateProduct(selectedProduct._id, payload);
      
      // Update local product list state
      setProducts(prev =>
        prev.map(p =>
          p._id === selectedProduct._id
            ? { ...p, variants: modalVariants }
            : p
        )
      );
      setIsModalOpen(false);
      alert("Variants updated successfully!");
    } catch (err) {
      console.error("Failed to save variants changes:", err);
      alert("Error saving variant pricing details.");
    } finally {
      setSavingVariants(false);
    }
  };

  // Filter products by search term
  const filteredProducts = products.filter(p =>
    p.heading.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 text-dark-navy antialiased text-left pb-10">
      
      {/* Header Announcement Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-500 shadow-md ${
        globalSaleActive 
          ? "bg-gradient-to-r from-red-655/90 via-orange-500 to-amber-500 text-white" 
          : "bg-white border border-light-border/60 text-dark-navy dark:text-white"
      }`}>
        <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-20 dark:opacity-40 animate-pulse">
          <Sparkles size={100} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-3.5 flex-wrap">
              <span className="text-2xl sm:text-3xl">🎉</span>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-none uppercase">
                {globalSaleActive ? `${saleName} is ACTIVE!` : "Festive Sales Hub"}
              </h1>
              {globalSaleActive && (
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-white/30 animate-pulse">
                  <Flame size={10} className="fill-current" /> Live
                </span>
              )}
            </div>
            <p className={`text-xs sm:text-sm font-semibold max-w-3xl leading-relaxed ${
              globalSaleActive ? "text-orange-50" : "text-muted-gray"
            }`}>
              {globalSaleActive 
                ? "Customers across the storefront will view festive pricing badges, crossed-out original rates, and special custom discounts on participating products."
                : "The global sale event is currently inactive. Customers see standard catalog pricing regardless of individual seller product sale settings."}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Panel: Global Sale Controls */}
      {isAdmin && (
        <div className="grid gap-6 md:grid-cols-3 animate-fadeIn">
          
          {/* Central Toggler Card */}
          <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-muted-gray uppercase tracking-widest flex items-center gap-1.5">
                <Settings2 size={14} className="text-primary" /> Central Activation Switch
              </h3>
              <p className="text-xs text-muted-gray leading-relaxed font-semibold">
                Toggle the switch below to instantly set the entire store's festive prices live or reverse back to standard pricing.
              </p>
            </div>
            
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-light-border/20">
              <span className="text-xs font-black uppercase tracking-wider text-dark-navy">
                Sale Visibility Status:
              </span>
              <button
                onClick={handleToggleGlobalSale}
                disabled={configLoading}
                className="focus:outline-none transition-transform hover:scale-105"
              >
                {globalSaleActive ? (
                  <ToggleRight size={50} className="text-orange-500 cursor-pointer" />
                ) : (
                  <ToggleLeft size={50} className="text-zinc-300 cursor-pointer" />
                )}
              </button>
            </div>
          </div>

          {/* Event Naming & Theme Card */}
          <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xs space-y-4 md:col-span-2">
            <h3 className="text-sm font-extrabold text-muted-gray uppercase tracking-widest flex items-center gap-1.5">
              <Percent size={14} className="text-primary" /> Configure Event Branding & Theme
            </h3>
            <p className="text-xs text-muted-gray leading-relaxed font-semibold">
              Select the active festival and write the promotional name. YoCart will adapt its styles and colors dynamically to match your chosen event!
            </p>
            
            <form onSubmit={handleSaveSaleName} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-muted-gray uppercase tracking-widest">Sale Event Name</label>
                  <input
                    type="text"
                    value={saleName}
                    onChange={(e) => setSaleName(e.target.value)}
                    placeholder="e.g. Diwali Sale, Festive Season Sale"
                    className="w-full bg-slate-50 border border-light-border rounded-xl px-4 py-2.5 text-xs font-bold text-dark-navy outline-none focus:bg-white focus:border-primary transition-all"
                  />
                </div>
                <div className="w-full sm:w-64 space-y-1.5 text-left relative z-20">
                  <label className="text-[10px] font-black text-muted-gray uppercase tracking-widest block">Select Festival Theme</label>
                  <button
                    type="button"
                    onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                    className="w-full bg-slate-50 border border-light-border rounded-xl px-4 py-2.5 text-xs font-bold text-dark-navy outline-none hover:bg-slate-100 transition-all h-[38px] cursor-pointer flex items-center justify-between shadow-2xs"
                  >
                    <span>
                      {saleTheme === "normal" && "Normal (Default Theme)"}
                      {saleTheme === "diwali" && "Diwali (Warm Orange/Gold)"}
                      {saleTheme === "summer" && "Summer (Sunny Sky Blue/Yellow)"}
                      {saleTheme === "winter" && "Winter (Cool Frost Cyan/Blue)"}
                      {saleTheme === "holi" && "Holi (Multi-Color Splash)"}
                      {saleTheme === "christmas" && "Christmas (Red/Green)"}
                      {saleTheme === "yocart" && "YoCart Special (Neon Violet)"}
                    </span>
                    <ChevronDown size={14} className={`text-muted-gray transition-transform duration-300 ${themeDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {themeDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setThemeDropdownOpen(false)}></div>
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-light-border/60 rounded-2xl shadow-md p-1.5 z-20 animate-scaleUp text-left max-h-60 overflow-y-auto">
                        {[
                          { key: "normal", label: "Normal (Default Theme)", color: "text-slate-500 bg-slate-50/50" },
                          { key: "diwali", label: "Diwali (Warm Orange/Gold)", color: "text-amber-500 bg-amber-50/50" },
                          { key: "summer", label: "Summer (Sunny Sky Blue/Yellow)", color: "text-yellow-500 bg-yellow-50/50" },
                          { key: "winter", label: "Winter (Cool Frost Cyan/Blue)", color: "text-cyan-500 bg-cyan-50/50" },
                          { key: "holi", label: "Holi (Vibrant Multi-Color Splash)", color: "text-rose-500 bg-rose-50/50" },
                          { key: "christmas", label: "Christmas (Festive Red/Green)", color: "text-emerald-500 bg-emerald-50/50" },
                          { key: "yocart", label: "YoCart Special (Premium Neon Violet)", color: "text-primary bg-indigo-50/50" }
                        ].map((item) => {
                          const isSelected = saleTheme === item.key;
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => {
                                setSaleTheme(item.key);
                                setThemeDropdownOpen(false);
                              }}
                              className={`group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition-all text-left mt-0.5 ${
                                isSelected ? "bg-primary/5 text-primary font-black" : "text-muted-gray hover:bg-slate-50 hover:text-dark-navy"
                              }`}
                            >
                              <div className={`w-5.5 h-5.5 rounded-md flex items-center justify-center ${item.color} transition-all duration-200 group-hover:scale-105 shrink-0`}>
                                <Palette className="w-3 h-3" />
                              </div>
                              <span className="text-[11px] font-bold transition-colors">
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
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={configLoading || !saleName.trim()}
                  className="bg-primary text-white hover:bg-primary-hover disabled:bg-zinc-100 disabled:text-zinc-400 text-xs font-extrabold px-6 py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 h-[38px]"
                >
                  {configLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save Branding & Theme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Panel: Product Pricing Management */}
      {isVendor && (
        <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border/30 pb-5">
            <div>
              <h2 className="text-lg font-black text-dark-navy tracking-tight">
                Manage Product Sale Pricing
              </h2>
              <p className="text-xs text-muted-gray font-semibold mt-1">
                Configure which of your products participate in the ongoing sale event and customize their promotional sale prices.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-light-border/80 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-primary w-56 transition-all"
              />
              <button
                onClick={fetchProductsData}
                disabled={productsLoading}
                className="p-2 border border-light-border/80 rounded-xl hover:bg-slate-50 text-muted-gray cursor-pointer"
              >
                <RefreshCw size={14} className={productsLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {productsLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
              <p className="text-xs font-bold text-muted-gray">Loading catalog products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
              <AlertTriangle className="text-amber-500 w-8 h-8" />
              <p className="text-sm font-black text-dark-navy">No products found</p>
              <p className="text-xs text-muted-gray max-w-xs font-semibold">
                Try refining your search term or make sure you have added products to your store catalog.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-light-border/40">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-light-border/40 text-[10px] font-extrabold uppercase tracking-widest text-muted-gray select-none">
                    <th className="py-3.5 px-5">Product Details</th>
                    <th className="py-3.5 px-5">Base Price</th>
                    <th className="py-3.5 px-5">Festive Sale?</th>
                    <th className="py-3.5 px-5">Special Price</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border/40">
                  {filteredProducts.map((p) => {
                    const hasVariants = p.variants && p.variants.length > 0;
                    
                    return (
                      <tr key={p._id} className="hover:bg-slate-50/30 transition-all">
                        {/* Image & Title */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-light-border/30 overflow-hidden flex-shrink-0">
                              <img
                                src={p.imgUrl}
                                alt={p.heading}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-dark-navy line-clamp-1">
                                {p.heading}
                              </h4>
                              {hasVariants ? (
                                <span className="inline-flex mt-1 text-[9px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md uppercase">
                                  {p.variants.length} Variants
                                </span>
                              ) : (
                                <span className="inline-flex mt-1 text-[9px] font-extrabold bg-zinc-50 text-zinc-500 border border-zinc-200/50 px-2 py-0.5 rounded-md uppercase">
                                  Single Product
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Base Price */}
                        <td className="py-4 px-5 text-xs font-bold text-dark-navy">
                          {hasVariants ? (
                            <span className="text-muted-gray text-[11px]">Multiple prices</span>
                          ) : (
                            `₹${(p.price || 0).toLocaleString()}`
                          )}
                        </td>

                        {/* On Sale Switch */}
                        <td className="py-4 px-5">
                          {hasVariants ? (
                            <span className="text-[10px] font-extrabold text-muted-gray uppercase">
                              Managed in variants
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setProducts(prev =>
                                  prev.map(item =>
                                    item._id === p._id
                                      ? { ...item, onSale: !item.onSale }
                                      : item
                                  )
                                );
                              }}
                              className="focus:outline-none"
                            >
                              {p.onSale ? (
                                <ToggleRight className="text-orange-500 w-11 h-6 cursor-pointer" />
                              ) : (
                                <ToggleLeft className="text-zinc-300 w-11 h-6 cursor-pointer" />
                              )}
                            </button>
                          )}
                        </td>

                        {/* Special Price Input */}
                        <td className="py-4 px-5">
                          {hasVariants ? (
                            <button
                              onClick={() => handleOpenVariantsModal(p)}
                              className="text-[10px] font-black text-primary hover:text-primary-hover flex items-center gap-1 bg-primary/5 hover:bg-primary/10 border border-primary/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer uppercase"
                            >
                              Configure Variants
                            </button>
                          ) : (
                            <div className="relative w-32">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-gray">
                                ₹
                              </span>
                              <input
                                type="number"
                                value={p.salePrice || ""}
                                disabled={!p.onSale}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setProducts(prev =>
                                    prev.map(item =>
                                      item._id === p._id
                                        ? { ...item, salePrice: val }
                                        : item
                                    )
                                  );
                                }}
                                placeholder="Sale price"
                                className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-light-border/60 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold text-dark-navy outline-none focus:bg-white focus:border-primary transition-all"
                              />
                            </div>
                          )}
                        </td>

                        {/* Action Row */}
                        <td className="py-4 px-5 text-right">
                          {!hasVariants && (
                            <button
                              onClick={() => handleSaveFlatProductChanges(p)}
                              disabled={savingProductId === p._id}
                              className="bg-primary/10 text-primary hover:bg-primary hover:text-white disabled:bg-zinc-50 disabled:text-zinc-400 border border-primary/20 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              {savingProductId === p._id ? (
                                <Loader2 size={11} className="animate-spin" />
                              ) : (
                                <Check size={11} />
                              )}
                              Save Settings
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product Variant Details Modal Editor */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-light-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-light-border/40 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-dark-navy">
                  Configure Variants - {selectedProduct.heading}
                </h3>
                <p className="text-[11px] text-muted-gray font-semibold mt-0.5">
                  Customize the participation of product variants in the active festive sale.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-gray hover:text-dark-navy p-1.5 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <XComponent size={18} />
              </button>
            </div>

            {/* Modal Scrollable Table Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {modalVariants.length === 0 ? (
                <p className="text-xs font-semibold text-muted-gray text-center py-8">
                  No active variants found for this product.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-light-border/30">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-light-border/30 text-[9px] font-extrabold uppercase tracking-widest text-muted-gray">
                        <th className="py-2.5 px-4">Variant (Attributes)</th>
                        <th className="py-2.5 px-4">Base Price</th>
                        <th className="py-2.5 px-4">Sale?</th>
                        <th className="py-2.5 px-4">Special Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-light-border/30">
                      {modalVariants.map((v, index) => {
                        const attrStr = (v.attributes || []).map(a => `${a.name}: ${a.value}`).join(", ");
                        
                        return (
                          <tr key={v._id || index} className="hover:bg-slate-50/40">
                            <td className="py-3 px-4 text-xs font-bold text-dark-navy">
                              {attrStr || "Default Variant"}
                            </td>
                            <td className="py-3 px-4 text-xs font-semibold text-muted-gray">
                              ₹{(v.price || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => {
                                  setModalVariants(prev =>
                                    prev.map((item, idx) =>
                                      idx === index ? { ...item, onSale: !item.onSale } : item
                                    )
                                  );
                                }}
                                className="focus:outline-none"
                              >
                                {v.onSale ? (
                                  <ToggleRight className="text-orange-500 w-10 h-5 cursor-pointer" />
                                ) : (
                                  <ToggleLeft className="text-zinc-300 w-10 h-5 cursor-pointer" />
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <div className="relative w-28">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-gray">
                                  ₹
                                </span>
                                <input
                                  type="number"
                                  value={v.salePrice || ""}
                                  disabled={!v.onSale}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setModalVariants(prev =>
                                      prev.map((item, idx) =>
                                        idx === index ? { ...item, salePrice: val } : item
                                      )
                                    );
                                  }}
                                  placeholder="Sale price"
                                  className="w-full pl-5 pr-2 py-1 bg-slate-50 border border-light-border/60 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold text-dark-navy outline-none focus:bg-white focus:border-primary transition-all"
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-slate-50 border-t border-light-border/40 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-light-border hover:bg-white text-muted-gray hover:text-dark-navy text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVariantsChanges}
                disabled={savingVariants}
                className="bg-primary hover:bg-primary-hover disabled:bg-zinc-100 disabled:text-zinc-400 px-5 py-2 text-white text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                {savingVariants ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Check size={12} />
                )}
                Save Variant Prices
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Modal Close Button Custom Component helper
const XComponent = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default SaleManagement;
