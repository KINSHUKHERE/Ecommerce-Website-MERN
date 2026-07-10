import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Store, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  Calendar,
  Loader2,
  Package
} from "lucide-react";
import { getPublicVendorApi } from "../api/AuthApi";
import { getProduct } from "../api/ProductApi";
import { getUserOrders } from "../api/OrderApi";
import EachProduct from "../components/EachProduct";

const VendorStore = () => {
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myOrdersCount, setMyOrdersCount] = useState(0);
  const [myTotalSpent, setMyTotalSpent] = useState(0);

  const loadStoreData = async () => {
    try {
      const [vendorRes, productsRes] = await Promise.all([
        getPublicVendorApi(vendorId),
        getProduct()
      ]);

      const foundVendor = vendorRes.data.vendor;
      setVendor(foundVendor);

      const allProducts = productsRes.data.data || [];
      const vendorProducts = allProducts.filter(
        p => p.vendorId && (p.vendorId._id === vendorId || p.vendorId === vendorId)
      );
      setProducts(vendorProducts);

      // Calculate logged-in user's orders at this vendor
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const ordersRes = await getUserOrders();
          const userOrdersList = ordersRes.data.orders || [];
          
          let ordersCount = 0;
          let totalSpent = 0;
          
          userOrdersList.forEach(order => {
            if (order.orderStatus === "Cancelled") return;
            
            const vendorItems = order.items.filter(item => {
              const pid = item.productId?._id || item.productId;
              return pid && vendorProducts.some(p => p._id.toString() === pid.toString());
            });
            
            if (vendorItems.length > 0) {
              ordersCount += 1;
              totalSpent += vendorItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            }
          });
          
          setMyOrdersCount(ordersCount);
          setMyTotalSpent(totalSpent);
        } catch (orderErr) {
          console.error("Failed to load user orders for storefront", orderErr);
        }
      }
    } catch (err) {
      console.error("Error loading vendor public store data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, [vendorId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-xs font-semibold text-muted-gray animate-pulse">Entering storefront...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-16 text-dark-navy antialiased">
        <h2 className="text-xl font-extrabold mb-4">Vendor Storefront Not Found</h2>
        <Link 
          to="/products"
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-extrabold uppercase hover:bg-slate-50 transition"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-dark-navy antialiased text-left space-y-8">
      {/* Back navigation */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-extrabold uppercase text-muted-gray hover:text-primary transition"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
      </div>

      {/* Premium Glassmorphic Store Header banner */}
      <div className="bg-slate-50/60 rounded-3xl p-6 md:p-8 border border-light-border/40 flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center text-3xl font-extrabold shadow-md flex-shrink-0">
            🏪
          </div>
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-black tracking-tight">{vendor.businessName || "Unnamed Store"}</h1>
            <p className="text-xs text-muted-gray font-bold uppercase tracking-wider">
              Authorized Marketplace Seller • GSTIN: <span className="font-mono">{vendor.gstin || "N/A"}</span>
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-1 break-all"><Mail size={13} className="text-muted-gray" /> {vendor.email}</span>
              {vendor.phoneNumber && (
                <span className="flex items-center gap-1"><Phone size={13} className="text-muted-gray" /> {vendor.phoneNumber}</span>
              )}
              {vendor.businessAddress && (
                <span className="flex items-center gap-1"><MapPin size={13} className="text-muted-gray" /> {vendor.businessAddress}</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/80 border border-light-border/40 rounded-2xl p-4 flex gap-4 sm:gap-6 items-center text-center self-stretch md:self-auto justify-around shadow-2xs flex-wrap md:flex-nowrap">
          <div className="min-w-20">
            <span className="text-[9px] font-extrabold text-muted-gray uppercase block tracking-wider mb-0.5">Total Products</span>
            <span className="text-sm sm:text-base font-black text-dark-navy flex items-center gap-1 justify-center"><Package size={14} className="text-primary" /> {products.length} Items</span>
          </div>
          
          {localStorage.getItem("token") && (
            <>
              <div className="border-l border-light-border/40 h-8 hidden sm:block"></div>
              <div className="min-w-20">
                <span className="text-[9px] font-extrabold text-muted-gray uppercase block tracking-wider mb-0.5">My Orders Here</span>
                <span className="text-sm sm:text-base font-black text-[#15877F] block">{myOrdersCount} Order{myOrdersCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="border-l border-light-border/40 h-8 hidden sm:block"></div>
              <div className="min-w-20">
                <span className="text-[9px] font-extrabold text-muted-gray uppercase block tracking-wider mb-0.5">My Total Spent</span>
                <span className="text-sm sm:text-base font-black text-emerald-600 block">₹{myTotalSpent.toLocaleString()}</span>
              </div>
            </>
          )}

          <div className="border-l border-light-border/40 h-8"></div>
          <div className="min-w-20">
            <span className="text-[9px] font-extrabold text-muted-gray block uppercase tracking-wider mb-0.5">Merchant Since</span>
            <span className="text-xs font-bold text-dark-navy block pt-0.5">
              {new Date(vendor.createdAt).toLocaleDateString("en-IN", {
                month: "short", year: "numeric"
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="space-y-6">
        <h2 className="text-lg font-black tracking-tight border-b border-light-border/40 pb-3">
          Products by {vendor.businessName} ({products.length})
        </h2>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <EachProduct
                key={product._id}
                data={product}
                onRefresh={loadStoreData}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50/30 rounded-3xl border border-dashed border-light-border/60">
            <Package className="w-10 h-10 text-muted-gray mx-auto mb-3" />
            <p className="text-xs font-semibold text-muted-gray">This seller hasn't listed any products yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorStore;
