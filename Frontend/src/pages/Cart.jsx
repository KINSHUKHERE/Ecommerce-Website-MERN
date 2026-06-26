import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Check, X } from "lucide-react";
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
      <div className="flex-grow w-full bg-[#f1f3f6] p-6 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#15877F]"></div>
        <p className="text-gray-500 mt-4 animate-pulse">Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full bg-neutral-50 px-2 sm:px-6 py-6 pb-24 lg:pb-8 font-sans antialiased relative">
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-left border-b border-gray-100 pb-3 tracking-tight">
          Shopping Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Cart is Empty 🛒
            </h2>
            <p className="text-gray-500 mt-2">Add products to see them here.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                >
                  {/* Outer Flex Container (Mobile: Column, Tablet/Desktop: Row) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left: Product Image, Quantity Counter & Details */}
                    <div className="flex gap-4 items-center flex-1 min-w-0 text-left">
                      
                      {/* Image & Counter in Column */}
                      <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain bg-neutral-50 rounded-lg p-1 border border-gray-100"
                        />
                        
                        {/* Quantity Counter (Compact) */}
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-xs">
                          <button
                            onClick={() => handleDecrease(item.id)}
                            disabled={item.quantity <= 1 || updatingId !== null}
                            className={`px-2 py-0.5 text-gray-500 font-bold hover:bg-gray-100 transition rounded-l ${
                              item.quantity <= 1 || updatingId !== null ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                            }`}
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-semibold text-gray-800 border-x border-gray-100 min-w-[24px] text-center flex items-center justify-center">
                            {updatingId === item.id ? (
                              <svg className="animate-spin h-3 w-3 text-[#15877F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => handleIncrease(item.id)}
                            disabled={updatingId !== null}
                            className={`px-2 py-0.5 text-gray-500 font-bold hover:bg-gray-100 transition rounded-r ${
                              updatingId !== null ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </div>
 
                      {/* Name & Unit Price */}
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        {item.attributes && (
                          <p className="text-xs text-[#088178] font-medium mt-0.5">
                            {item.attributes}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Unit Price: ₹{item.price.toLocaleString()}
                        </p>
                      </div>
 
                    </div>
 
                    {/* Middle/Right elements (Subtotal and Actions grouped) */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                      
                      {/* Subtotal */}
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-gray-400 uppercase block font-semibold tracking-wider">Subtotal</span>
                        <span className="text-base sm:text-lg font-extrabold text-indigo-600">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
 
                      {/* Remove Button */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={updatingId !== null}
                        className={`transition-colors p-2 rounded-lg hover:bg-red-50 flex items-center justify-center outline-none focus:outline-none ${
                          updatingId !== null 
                            ? "text-gray-300 cursor-not-allowed" 
                            : "text-gray-400 hover:text-red-650 cursor-pointer"
                        }`}
                        title="Remove item"
                      >
                        {updatingId === item.id ? (
                          <svg className="animate-spin h-[18px] w-[18px] text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>

                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Price Details Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit shadow-sm text-left">
              <h2 className="text-xs font-semibold text-gray-400 tracking-wider uppercase border-b border-gray-100 pb-3 mb-4">
                Price Details
              </h2>

              <div className="space-y-4 text-sm sm:text-base">
                <div className="flex justify-between text-gray-700">
                  <span>Price ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-semibold text-gray-900">₹{totalPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Delivery Charges</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>

                <hr className="border-gray-100 my-1" />

                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrderClick}
                className="hidden lg:block w-full mt-6 bg-[#fb641b] hover:bg-[#e05310] text-white py-3.5 rounded-xl font-semibold transition-all shadow-md cursor-pointer outline-none"
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-150 px-4 py-3.5 z-50 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="text-left flex flex-col">
            <span className="text-[10px] text-gray-400 leading-none">
              Total Amount
            </span>
            <span className="text-lg font-extrabold text-gray-950 mt-1.5 leading-none">
              ₹{totalPrice.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handlePlaceOrderClick}
            className="bg-[#fb641b] hover:bg-[#e05310] text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-md transition-all cursor-pointer outline-none"
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
