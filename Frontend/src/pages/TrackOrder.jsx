import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, ShoppingBag, MapPin, Calendar, ClipboardList, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { publicTrackOrderApi } from "../api/OrderApi";

const TrackOrder = () => {
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      setError("Please enter a valid Order ID or Transaction Reference ID.");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await publicTrackOrderApi(trackingId.trim());
      if (res.data) {
        setOrder(res.data);
      } else {
        setError("No tracking information available for this reference ID.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Could not find any order with this ID. Double check the ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine status step
  const getStepNumber = (status) => {
    if (status === "Delivered") return 3;
    if (status === "Shipped") return 2;
    return 1; // Processing/Confirmed
  };

  const currentStep = order ? getStepNumber(order.orderStatus) : 1;

  return (
    <div className="flex-grow w-full bg-soft-bg/30 py-12 text-dark-navy antialiased text-left px-4">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Header Block */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-dark-navy tracking-tight uppercase">Track Your Order</h1>
          <p className="text-xs text-muted-gray font-semibold max-w-sm mx-auto leading-relaxed">
            Enter your Order Reference ID or Transaction ID to check real-time courier status and delivery progress.
          </p>
        </div>

        {/* Search Search Form */}
        <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest block pl-1">
                Order or Transaction ID
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-gray w-4 h-4" />
                <input
                  type="text"
                  placeholder="e.g. 660f73ed001b2a... or pay_OyXb..."
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white py-3 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Tracking Shipment...</span>
                </>
              ) : (
                <>
                  <span>Track Shipment</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-red-655 text-xs font-semibold">
              <span className="text-sm">⚠️</span>
              <p className="leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* Results Block */}
        {order && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Stepper Card */}
            <div className="bg-white border border-light-border/60 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-xs font-extrabold text-dark-navy uppercase tracking-wider">
                  Shipment Tracking Progress
                </h3>
                <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full border uppercase tracking-wider ${
                  order.orderStatus === "Delivered"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                    : order.orderStatus === "Cancelled"
                    ? "bg-red-50 text-red-655 border-red-100/50"
                    : "bg-indigo-50 text-indigo-650 border-indigo-100/50"
                }`}>
                  {order.orderStatus}
                </span>
              </div>

              {order.orderStatus === "Cancelled" ? (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs font-semibold">
                  <span className="text-sm">⚠️</span>
                  <p>This order has been cancelled. Refunds will be processed to the original payment source within 5-7 business days.</p>
                </div>
              ) : (
                /* Stepper graphic */
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-2 py-2 relative w-full">
                  {/* Step 1 */}
                  <div className="flex sm:flex-col items-center gap-2.5 sm:gap-1.5 flex-1 z-10 text-left sm:text-center w-full">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] border-2 transition-all ${
                      currentStep >= 1
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-white text-muted-gray border-slate-200"
                    }`}>
                      1
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-dark-navy leading-none">Processing</h4>
                      <p className="text-[9px] text-muted-gray mt-0.5 font-semibold">Confirmed & packing</p>
                    </div>
                  </div>

                  {/* Connector 1 */}
                  <div className="hidden sm:block flex-1 h-[2px] bg-slate-100 mx-2 relative">
                    <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-500" style={{
                      width: currentStep >= 2 ? "100%" : "0%"
                    }}></div>
                  </div>
                  <div className="sm:hidden w-[2px] h-4 bg-slate-100 ml-3 -my-2 relative">
                    <div className="absolute top-0 left-0 w-full bg-primary transition-all duration-500" style={{
                      height: currentStep >= 2 ? "100%" : "0%"
                    }}></div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex sm:flex-col items-center gap-2.5 sm:gap-1.5 flex-1 z-10 text-left sm:text-center w-full">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] border-2 transition-all ${
                      currentStep >= 2
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-white text-muted-gray border-slate-200"
                    }`}>
                      2
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-dark-navy leading-none">Shipped</h4>
                      <p className="text-[9px] text-muted-gray mt-0.5 font-semibold">
                        {order.courierName ? `Via ${order.courierName}` : "In transit"}
                      </p>
                    </div>
                  </div>

                  {/* Connector 2 */}
                  <div className="hidden sm:block flex-1 h-[2px] bg-slate-100 mx-2 relative">
                    <div className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-500" style={{
                      width: currentStep >= 3 ? "100%" : "0%"
                    }}></div>
                  </div>
                  <div className="sm:hidden w-[2px] h-4 bg-slate-100 ml-3 -my-2 relative">
                    <div className="absolute top-0 left-0 w-full bg-emerald-500 transition-all duration-500" style={{
                      height: currentStep >= 3 ? "100%" : "0%"
                    }}></div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex sm:flex-col items-center gap-2.5 sm:gap-1.5 flex-1 z-10 text-left sm:text-center w-full">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] border-2 transition-all ${
                      currentStep >= 3
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-muted-gray border-slate-200"
                    }`}>
                      3
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-dark-navy leading-none">Delivered</h4>
                      <p className="text-[9px] text-muted-gray mt-0.5 font-semibold">At your door</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Estimation / AWB Code Info */}
              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs font-semibold text-muted-gray">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-primary" />
                  <span>
                    Estimated Delivery: <strong className="text-dark-navy">{
                      new Date(new Date(order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                        weekday: "long",
                        month: "short",
                        day: "numeric"
                      })
                    }</strong>
                  </span>
                </div>
                {order.awbCode && (
                  <div className="flex items-center gap-2">
                    <ClipboardList size={14} className="text-primary" />
                    <span>
                      Tracking AWB: <strong className="text-dark-navy select-all font-mono">{order.awbCode}</strong>
                      {order.courierName && <span className="ml-1 text-[10px] bg-slate-100 text-muted-gray px-1.5 py-0.5 rounded font-black uppercase">{order.courierName}</span>}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Shiprocket Courier Checks Logs (If available) */}
            {order.trackingData && order.trackingData.shipment_track_activities && order.trackingData.shipment_track_activities.length > 0 && (
              <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs space-y-4">
                <h3 className="text-xs font-extrabold text-dark-navy uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <span>📍</span> Real-Time Courier Activity Log
                </h3>
                <div className="space-y-4 pl-1">
                  {order.trackingData.shipment_track_activities.map((activity, idx) => (
                    <div key={idx} className="flex gap-3 relative">
                      {/* Timeline line */}
                      {idx !== order.trackingData.shipment_track_activities.length - 1 && (
                        <div className="absolute left-[5px] top-[14px] bottom-[-22px] w-[1.5px] bg-slate-100"></div>
                      )}
                      
                      {/* Dot icon */}
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5 ${
                        idx === 0 
                          ? "bg-primary border-primary shadow-xs" 
                          : "bg-white border-slate-200"
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${idx === 0 ? "bg-white" : "bg-slate-350"}`}></div>
                      </div>

                      {/* Details */}
                      <div className="space-y-0.5">
                        <h4 className={`text-xs font-bold leading-tight ${idx === 0 ? "text-primary font-black" : "text-dark-navy"}`}>
                          {activity.activity}
                        </h4>
                        <p className="text-[10px] text-muted-gray font-semibold leading-none">
                          {activity.location || "In Transit"} • {activity.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Items Info Card */}
            <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-extrabold text-dark-navy uppercase tracking-wider pb-2 border-b border-slate-100">
                Items In This Shipment
              </h3>
              <div className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex gap-3 items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex gap-3 items-center min-w-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-xl border border-slate-100 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-5 h-5 text-muted-gray/50" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-dark-navy truncate leading-tight">{item.name}</h4>
                        <span className="text-[10px] text-muted-gray font-semibold mt-0.5 block">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-dark-navy font-mono">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-xs font-bold">
                <span className="text-muted-gray">Total Paid</span>
                <span className="text-dark-navy text-sm font-black">₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TrackOrder;
