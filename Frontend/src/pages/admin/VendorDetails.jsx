import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Store, 
  Mail, 
  Phone, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Loader2, 
  IndianRupee, 
  Package, 
  ShoppingCart,
  Calendar,
  MapPin,
  FileText
} from "lucide-react";
import { getVendorsApi, updateVendorStatusApi, deleteVendorApi } from "../../api/AuthApi";
import { getProduct } from "../../api/ProductApi";
import { getAllOrders } from "../../api/OrderApi";

const VendorDetails = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: [],
    ordersCount: 0,
    revenue: 0,
    orders: []
  });

  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const loadData = async () => {
    try {
      // Fetch vendors, products, and orders
      const [vendorsRes, productsRes, ordersRes] = await Promise.all([
        getVendorsApi(),
        getProduct(),
        getAllOrders()
      ]);

      const foundVendor = (vendorsRes.data.vendors || []).find(v => v._id === vendorId);
      setVendor(foundVendor);

      if (foundVendor) {
        const allProducts = productsRes.data.data || [];
        const allOrders = ordersRes.data.orders || [];

        // 1. Filter products by this vendor
        const vendorProducts = allProducts.filter(
          p => p.vendorId && (p.vendorId._id === vendorId || p.vendorId === vendorId)
        );

        // 2. Filter orders containing any of these product IDs
        const vendorProductIds = vendorProducts.map(p => p._id.toString());
        const vendorOrders = allOrders.filter(order => {
          return order.items.some(item => {
            const pid = item.productId?._id || item.productId;
            return pid && vendorProductIds.includes(pid.toString());
          });
        });

        // 3. Calculate total vendor revenue from order items
        let totalRevenue = 0;
        const vendorFilteredOrders = vendorOrders.map(order => {
          const filteredItems = order.items.filter(item => {
            const pid = item.productId?._id || item.productId;
            return pid && vendorProductIds.includes(pid.toString());
          });
          const orderTotal = filteredItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
          if (order.orderStatus !== "Cancelled") {
            totalRevenue += orderTotal;
          }
          return {
            ...order,
            vendorTotal: orderTotal,
            vendorItems: filteredItems
          };
        });

        setStats({
          products: vendorProducts,
          ordersCount: vendorOrders.length,
          revenue: totalRevenue,
          orders: vendorFilteredOrders
        });
      }
    } catch (err) {
      console.error("Error loading vendor details page data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      const res = await updateVendorStatusApi(vendorId, newStatus);
      showToast(res.data.msg || "Vendor status updated", "success");
      setVendor(prev => ({ ...prev, vendorStatus: newStatus }));
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Failed to update status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVendor = async () => {
    setActionLoading(true);
    try {
      await deleteVendorApi(vendorId);
      showToast("Vendor purged from database successfully", "success");
      setTimeout(() => {
        navigate("/admin/vendors");
      }, 1000);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Failed to delete vendor", "error");
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [vendorId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-xs font-semibold text-muted-gray animate-pulse">Loading seller profile details...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-12 text-dark-navy antialiased">
        <h2 className="text-xl font-extrabold mb-4">Vendor Profile Not Found</h2>
        <Link 
          to="/admin/vendors"
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-extrabold uppercase hover:bg-slate-50 transition"
        >
          <ArrowLeft size={14} /> Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="text-dark-navy antialiased text-left pb-12 space-y-6 relative">
      {/* Toast Alert */}
      {message && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-extrabold uppercase tracking-wide flex items-center gap-2 animate-slideRight ${
          toastType === "success" 
            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
            : "bg-red-50 text-red-655 border-red-100"
        }`}>
          {toastType === "success" ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {message}
        </div>
      )}

      {/* Header and Back Button */}
      <div className="flex items-center justify-between border-b border-light-border/40 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/vendors"
            className="p-2 border border-light-border hover:border-primary/30 hover:bg-primary/5 text-muted-gray hover:text-primary rounded-xl transition cursor-pointer"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {vendor.businessName || "Seller Details"}
            </h1>
            <p className="text-xs text-muted-gray font-semibold mt-0.5">
              Seller Account Profile & Sales Performance Directory.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {vendor.vendorStatus !== "active" && (
            <button
              onClick={() => handleUpdateStatus("active")}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 rounded-xl text-xs font-extrabold uppercase transition cursor-pointer disabled:opacity-50"
            >
              Approve Seller
            </button>
          )}
          {vendor.vendorStatus !== "suspended" && (
            <button
              onClick={() => handleUpdateStatus("suspended")}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 rounded-xl text-xs font-extrabold uppercase transition cursor-pointer disabled:opacity-50"
            >
              Suspend Seller
            </button>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={actionLoading}
            className="px-3 py-1.5 bg-red-50 text-red-655 border border-red-100 hover:bg-red-100 rounded-xl text-xs font-extrabold uppercase transition cursor-pointer disabled:opacity-50"
          >
            Delete Seller
          </button>
        </div>
      </div>

      {/* Main Grid: Info Left, Stats Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Store & Owner Details Card */}
        <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xs space-y-5 lg:col-span-1">
          <div className="flex items-center gap-4 pb-4 border-b border-light-border/40">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              {vendor.avatar ? (
                <img src={vendor.avatar} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Store size={22} />
              )}
            </div>
            <div>
              <h2 className="text-base font-extrabold">{vendor.businessName || "Unnamed Store"}</h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase mt-1 border ${
                vendor.vendorStatus === "active" 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                  : vendor.vendorStatus === "pending"
                  ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                  : "bg-red-50 text-red-600 border-red-100"
              }`}>
                {vendor.vendorStatus}
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div className="flex items-start gap-3">
              <Calendar className="text-muted-gray w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-muted-gray uppercase block tracking-wider">Joined Date</span>
                <span className="text-dark-navy mt-0.5 block">
                  {new Date(vendor.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric", month: "long", day: "numeric"
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="text-muted-gray w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-muted-gray uppercase block tracking-wider">Email Address</span>
                <span className="text-dark-navy mt-0.5 block">{vendor.email}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="text-muted-gray w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-muted-gray uppercase block tracking-wider">Phone Number</span>
                <span className="text-dark-navy mt-0.5 block">{vendor.phoneNumber || "N/A"}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="text-muted-gray w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-muted-gray uppercase block tracking-wider">GSTIN ID</span>
                <span className="text-dark-navy mt-0.5 block font-mono font-bold">{vendor.gstin || "N/A"}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="text-muted-gray w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-muted-gray uppercase block tracking-wider">Business Address</span>
                <span className="text-dark-navy mt-0.5 block leading-relaxed">{vendor.businessAddress || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: stats and tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest block">Total Products</span>
                <span className="text-xl sm:text-2xl font-black text-dark-navy mt-1 block">{stats.products.length}</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                <Package size={20} />
              </div>
            </div>

            <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest block">Seller Orders</span>
                <span className="text-xl sm:text-2xl font-black text-dark-navy mt-1 block">{stats.ordersCount}</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                <ShoppingCart size={20} />
              </div>
            </div>

            <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest block">Revenue</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">₹{stats.revenue.toLocaleString()}</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <IndianRupee size={20} />
              </div>
            </div>
          </div>

          {/* Products List Table */}
          <div className="bg-white border border-light-border/60 rounded-3xl shadow-2xs p-5 space-y-4">
            <h3 className="text-sm font-extrabold tracking-wider uppercase border-b border-light-border/30 pb-2">
              Store Catalog Products ({stats.products.length})
            </h3>
            
            {stats.products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-light-border/60 text-left">
                      <th className="px-4 py-3 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Image / Title</th>
                      <th className="px-4 py-3 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Category</th>
                      <th className="px-4 py-3 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest text-right">Price</th>
                      <th className="px-4 py-3 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest text-center font-semibold">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.products.map(prod => {
                      const totalStock = prod.variants && prod.variants.length > 0
                        ? prod.variants.reduce((acc, curr) => acc + (curr.quantity || 0), 0)
                        : (prod.quantity ?? 0);
                      return (
                        <tr key={prod._id} className="border-b border-light-border/40 hover:bg-slate-50/20">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={prod.imgUrl} alt={prod.heading} className="w-9 h-9 object-contain rounded-lg border bg-white" />
                              <span className="text-xs font-bold text-dark-navy truncate max-w-40 block">{prod.heading}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-600">
                            {prod.categoryId?.name || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-dark-navy text-right">
                            ₹{(prod.price || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              totalStock <= 0 
                                ? "bg-red-50 text-red-600" 
                                : totalStock <= 5
                                ? "bg-amber-50 text-amber-600"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              {totalStock} Left
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-xs font-semibold text-muted-gray py-6">No products uploaded yet.</p>
            )}
          </div>

          {/* Orders list */}
          <div className="bg-white border border-light-border/60 rounded-3xl shadow-2xs p-5 space-y-4">
            <h3 className="text-sm font-extrabold tracking-wider uppercase border-b border-light-border/30 pb-2">
              Seller Orders ({stats.ordersCount})
            </h3>
            
            {stats.orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-light-border/60 text-left">
                      <th className="px-4 py-3 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest font-mono">ID</th>
                      <th className="px-4 py-3 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Buyer Details</th>
                      <th className="px-4 py-3 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest text-center">Date</th>
                      <th className="px-4 py-3 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest text-center">Status</th>
                      <th className="px-4 py-3 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest text-right">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.orders.map(order => (
                      <tr key={order._id} className="border-b border-light-border/40 hover:bg-slate-50/20">
                        <td className="px-4 py-3 text-xs font-bold font-mono text-muted-gray">
                          #{order._id.substring(18)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-bold text-dark-navy">{order.userId?.name}</div>
                          <div className="text-[10px] text-muted-gray mt-0.5">{order.userId?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-center font-semibold text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            month: "short", day: "numeric", year: "numeric"
                          })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                            order.orderStatus === "Delivered"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : order.orderStatus === "Cancelled"
                              ? "bg-red-50 text-red-600 border-red-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-emerald-600 text-right">
                          ₹{order.vendorTotal.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-xs font-semibold text-muted-gray py-6">No orders received yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-scaleUp text-center relative">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-655 border border-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle size={20} />
            </div>

            <h3 className="text-base font-extrabold text-dark-navy tracking-tight mb-2">Delete Vendor Account?</h3>
            <p className="text-xs text-muted-gray font-semibold mb-6 px-2 leading-relaxed text-center">
              Are you sure you want to delete <strong className="text-dark-navy">{vendor.businessName}</strong> from the database? This will permanently delete their account and all associated product listings. This action is irreversible.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                disabled={actionLoading}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-light-border rounded-xl text-xs font-extrabold uppercase tracking-wider text-muted-gray hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleDeleteVendor}
                className="px-4 py-2 bg-red-655 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-red-600 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 size={12} className="animate-spin" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDetails;
