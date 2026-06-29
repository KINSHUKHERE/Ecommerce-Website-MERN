import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trash2, Check, X, ShoppingCart, Loader2, ArrowRight } from "lucide-react";
import {
  getDataCart,
  increaseCart,
  decreaseCart,
  deleteCart,
} from "../api/CartApi";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const localUser = JSON.parse(localStorage.getItem("user"));

  const fetchCartData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        setLoading(false);
        return;
      }

      const response = await getDataCart();

      const formattedData = response.data.cartData.map((item) => {
        const variant = item.variantId;
        const product = item.productId;
        
        const price = variant ? variant.price : (product.price || 0);
        const image = (variant && variant.images && variant.images.length > 0)
          ? variant.images[0]
          : product.imgUrl;
          
        const attributeString = (variant && variant.attributes && variant.attributes.length > 0)
          ? variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(", ")
          : "";

        return {
          id: item._id,
          productId: product._id,
          variantId: variant ? variant._id : "",
          name: product.heading,
          price,
          quantity: item.quantity,
          image,
          attributes: attributeString,
        };
      });

      setCartItems(formattedData);
    } catch (err) {
      console.log("Unable to fetch cart data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const handleIncrease = async (cartId) => {
    try {
      setUpdatingId(cartId);
      await increaseCart(cartId);
      await fetchCartData();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      const errMsg = err.response?.data?.msg || "Unable to increase quantity";
      showToast(errMsg, "error");
      console.log("Unable to increase quantity", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDecrease = async (cartId) => {
    try {
      setUpdatingId(cartId);
      await decreaseCart(cartId);
      await fetchCartData();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      const errMsg = err.response?.data?.msg || "Unable to decrease quantity";
      showToast(errMsg, "error");
      console.log("Unable to decrease quantity", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (cartId) => {
    try {
      setUpdatingId(cartId);
      await deleteCart(cartId);
      await fetchCartData();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.log("Unable to delete item", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const handlePlaceOrderClick = () => {
    if (!localUser) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="flex-grow w-full bg-white p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#088178] w-10 h-10 mb-4" />
        <p className="text-sm font-normal text-gray-500 animate-pulse">
          Opening your cart...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full bg-slate-50/50 px-4 sm:px-6 py-8 pb-24 lg:pb-12 font-sans antialiased relative">
      {/* Toast Alert Widget */}
      {message && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-150 shadow-md animate-slideIn">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              toastType === "success"
                ? "bg-green-50 text-green-600 border border-green-100"
                : "bg-red-50 text-red-655 border border-red-100"
            }`}
          >
            {toastType === "success" ? <Check size={14} /> : <X size={14} />}
          </div>
          <span className="text-sm font-medium text-gray-800">{message}</span>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-8 text-left border-b border-slate-100 pb-5 flex items-center gap-2">
          Shopping Cart
          <span className="bg-slate-100 text-slate-600 text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-sm ml-2">
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 px-6 bg-gradient-to-b from-white to-slate-50/30 border border-slate-100/80 rounded-3xl p-10 max-w-lg mx-auto shadow-[0_10px_40px_-15px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col items-center">
            {/* Ambient lighting backdrop */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-slate-500/5 rounded-full blur-2xl"></div>
            
            <div className="relative mb-6">
              {/* Ambient pulsing backdrop */}
              <div className="absolute inset-0 bg-[#088178]/5 rounded-full scale-125 blur-md animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-tr from-slate-50 to-emerald-50/50 text-[#088178] rounded-full flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_10px_20px_-5px_rgba(8,129,120,0.12)] border border-emerald-100/60">
                <ShoppingCart size={32} className="stroke-[2]" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Your Cart is Empty
            </h2>
            <p className="text-gray-500 text-sm mt-3 max-w-sm mx-auto leading-relaxed font-normal">
              Looks like you haven't added anything to your cart yet. Explore our catalog to find items you love!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 mt-8 px-8 py-3.5 bg-slate-900 hover:bg-[#088178] text-white text-sm font-bold rounded-xl shadow-[0_10px_20px_-5px_rgba(15,23,42,0.15)] hover:shadow-[0_10px_20px_-5px_rgba(8,129,120,0.25)] transition-all duration-300 active:scale-95 cursor-pointer group"
            >
              Start Shopping
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300 text-white/80" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.05)] transition-all duration-300"
                >
                  {/* Outer Flex Container (Mobile: Column, Tablet/Desktop: Row) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left: Product Image, Quantity Counter & Details */}
                    <div className="flex gap-4 items-center flex-1 min-w-0 text-left">
                      
                      {/* Image & Counter in Column */}
                      <div className="flex flex-col items-center gap-2.5 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-18 h-18 sm:w-20 sm:h-20 object-contain bg-slate-50 rounded-xl p-1.5 border border-slate-100/60"
                        />
                        
                        {/* Quantity Counter (Compact) */}
                        <div className="flex items-center border border-slate-200/80 rounded-lg bg-white overflow-hidden shadow-xs h-7">
                          <button
                            onClick={() => handleDecrease(item.id)}
                            disabled={item.quantity <= 1 || updatingId !== null}
                            className={`w-7 h-full flex items-center justify-center text-slate-500 font-bold hover:bg-slate-50 active:bg-slate-100 transition-colors ${
                              item.quantity <= 1 || updatingId !== null ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                            }`}
                          >
                            -
                          </button>
                          <span className="px-1.5 font-bold text-xs text-slate-850 border-x border-slate-100 min-w-[22px] h-full text-center flex items-center justify-center bg-white">
                            {updatingId === item.id ? (
                              <Loader2 size={11} className="animate-spin text-[#088178]" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => handleIncrease(item.id)}
                            disabled={updatingId !== null}
                            className={`w-7 h-full flex items-center justify-center text-slate-500 font-bold hover:bg-slate-50 active:bg-slate-100 transition-colors ${
                              updatingId !== null ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </div>
 
                      {/* Name & Unit Price */}
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug hover:text-[#088178] transition-colors truncate">
                          {item.name}
                        </h3>
                        {item.attributes && (
                          <p className="text-[11px] text-[#088178] font-semibold mt-1 bg-emerald-50/50 border border-emerald-100/30 px-2 py-0.5 rounded w-fit">
                            {item.attributes}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 font-medium mt-1.5">
                          Unit Price: ₹{item.price.toLocaleString()}
                        </p>
                      </div>
 
                    </div>
 
                    {/* Middle/Right elements (Subtotal and Actions grouped) */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-50 pt-3.5 sm:pt-0">
                      
                      {/* Subtotal */}
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] text-gray-400 uppercase block font-bold tracking-wider">Subtotal</span>
                        <span className="text-base sm:text-lg font-extrabold text-slate-800">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
 
                      {/* Remove Button */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={updatingId !== null}
                        className={`transition-all p-2 rounded-lg hover:bg-rose-50 flex items-center justify-center outline-none focus:outline-none ${
                          updatingId !== null 
                            ? "text-gray-200 cursor-not-allowed" 
                            : "text-gray-450 hover:text-red-500 cursor-pointer"
                        }`}
                        title="Remove item"
                      >
                        {updatingId === item.id ? (
                          <Loader2 size={18} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>

                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Price Summary Panel */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 h-fit shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] text-left">
              <h2 className="text-xs font-bold text-gray-400 tracking-wider uppercase border-b border-slate-50 pb-3 mb-4">
                Price Details
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Price ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-semibold text-slate-800">₹{totalPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>

                <hr className="border-slate-50 my-1" />

                <div className="flex justify-between text-base sm:text-lg font-extrabold text-slate-800">
                  <span>Total Amount</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrderClick}
                className="hidden lg:block w-full mt-6 py-3.5 bg-slate-900 hover:bg-[#088178] text-white text-sm font-bold rounded-xl shadow-[0_10px_20px_-5px_rgba(15,23,42,0.15)] hover:shadow-[0_10px_20px_-5px_rgba(8,129,120,0.25)] transition-all duration-300 active:scale-98 cursor-pointer outline-none"
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3.5 z-40 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
          <div className="text-left flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider leading-none">
              Total Amount
            </span>
            <span className="text-lg font-extrabold text-slate-800 mt-1.5 leading-none">
              ₹{totalPrice.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handlePlaceOrderClick}
            className="bg-slate-900 hover:bg-[#088178] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-[0_8px_20px_-6px_rgba(15,23,42,0.15)] transition-all duration-300 active:scale-98 cursor-pointer outline-none"
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
