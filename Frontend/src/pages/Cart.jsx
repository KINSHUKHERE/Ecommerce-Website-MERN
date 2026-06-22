import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  CreditCard,
  Smartphone,
  Check,
  Loader2,
  MapPin,
  X,
  Lock,
  ArrowRight,
  Sparkles
} from "lucide-react";
import {
  getDataCart,
  increaseCart,
  decreaseCart,
  deleteCart,
} from "../api/CartApi";
import { createOrder } from "../api/OrderApi";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiApp, setUpiApp] = useState("Google Pay");
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [processingMsg, setProcessingMsg] = useState("Connecting to Secure Gateway...");
  const [generatedTxnId, setGeneratedTxnId] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);

  const localUser = JSON.parse(localStorage.getItem("user"));

  const fetchCartData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        setLoading(false);
        return;
      }

      const response = await getDataCart(user._id);

      const formattedData = response.data.cartData.map((item) => ({
        id: item._id,
        productId: item.productId._id,
        name: item.productId.heading,
        price: item.productId.price,
        quantity: item.quantity,
        image: item.productId.imgUrl,
      }));

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
      await increaseCart(cartId);
      fetchCartData();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.log("Unable to increase quantity", err);
    }
  };

  const handleDecrease = async (cartId) => {
    try {
      await decreaseCart(cartId);
      fetchCartData();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.log("Unable to decrease quantity", err);
    }
  };

  const handleDelete = async (cartId) => {
    try {
      await deleteCart(cartId);
      fetchCartData();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.log("Unable to delete item", err);
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
    setIsCheckoutOpen(true);
    setCheckoutStep(1);
  };

  // Card input helpers
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(" ") || "";
    setCardDetails({ ...cardDetails, number: formatted });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    setCardDetails({ ...cardDetails, expiry: value });
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setCardDetails({ ...cardDetails, cvv: value });
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setCheckoutStep(2);
  };

  const handlePaymentSubmit = () => {
    const randomTxn = "TXN_" + Date.now() + Math.floor(100 + Math.random() * 900);
    setGeneratedTxnId(randomTxn);
    setCheckoutStep(3);
    setProcessingMsg("Connecting to Secure Gateway...");

    setTimeout(() => {
      setProcessingMsg("Authorizing Transaction...");
    }, 900);

    setTimeout(() => {
      setProcessingMsg("Finalizing Order Creation...");
    }, 1800);

    setTimeout(async () => {
      try {
        const orderData = {
          userId: localUser._id,
          items: cartItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          totalAmount: totalPrice,
          shippingAddress: {
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
          },
          paymentMethod,
          transactionId: randomTxn,
        };

        const res = await createOrder(orderData);
        setCreatedOrder(res.data.order);
        setCheckoutStep(4);
        setCartItems([]);
        window.dispatchEvent(new Event("cartUpdated"));
      } catch (err) {
        console.error("Order placement failed", err);
        alert("Payment was successful but we failed to record your order. Please contact support.");
        setIsCheckoutOpen(false);
      }
    }, 2700);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] p-6 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#15877F]"></div>
        <p className="text-gray-500 mt-4 animate-pulse">Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] px-2 sm:px-6 py-6 pb-24 lg:pb-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6 text-left border-b border-gray-200 pb-3">
          Shopping Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-600">
              Your Cart is Empty 🛒
            </h2>
            <p className="text-gray-500 mt-2">Add products to see them here.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 md:rounded-xl p-4 flex flex-col gap-3 shadow-sm"
                >
                  {/* Product Details Grid */}
                  <div className="flex gap-4 items-start">
                    <div className="flex flex-col items-center gap-3 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 sm:w-28 sm:h-28 object-contain bg-[#f9f9f9] rounded-lg p-1 border border-gray-100"
                      />

                      {/* Quantity Counter */}
                      <div className="flex items-center border border-gray-300 rounded bg-white">
                        <button
                          onClick={() => handleDecrease(item.id)}
                          disabled={item.quantity <= 1}
                          className={`px-2.5 py-0.5 text-gray-500 font-bold hover:bg-gray-100 transition rounded-l ${
                            item.quantity <= 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                          }`}
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs sm:text-sm font-semibold text-gray-800 border-x border-gray-200 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrease(item.id)}
                          className="px-2.5 py-0.5 text-gray-500 font-bold hover:bg-gray-100 transition rounded-r cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Info & Price */}
                    <div className="flex-1 min-w-0 text-left flex flex-col justify-between h-20 sm:h-28">
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate pr-4">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Price: ₹{item.price.toLocaleString()} each
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-gray-400">Subtotal:</p>
                        <p className="text-base sm:text-lg font-extrabold text-[#088178]">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Remove Action Button */}
                  <div className="border-t border-gray-100 pt-3 mt-1">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-full flex justify-center items-center gap-1.5 py-1 text-xs sm:text-sm text-gray-600 hover:text-red-600 font-bold cursor-pointer outline-none focus:outline-none"
                    >
                      <Trash2 size={16} />
                      REMOVE
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Details Summary */}
            <div className="bg-white md:rounded-xl border border-gray-200 p-5 h-fit shadow-sm text-left">
              <h2 className="text-xs font-bold text-gray-400 tracking-wider uppercase border-b border-gray-150 pb-3 mb-4">
                Price Details
              </h2>

              <div className="space-y-4 text-sm sm:text-base">
                <div className="flex justify-between text-gray-700">
                  <span>Price ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Delivery Charges</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>

                <hr className="border-gray-100 my-1" />

                <div className="flex justify-between text-lg font-extrabold text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Desktop Place Order Button */}
              <button
                onClick={handlePlaceOrderClick}
                className="hidden lg:block w-full mt-6 bg-[#fb641b] text-white py-3 rounded-lg font-extrabold hover:bg-[#e05310] transition shadow-md shadow-[#fb641b]/10 cursor-pointer active:scale-98 outline-none focus:outline-none"
              >
                PLACE ORDER
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Action Bar */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <div className="text-left flex flex-col">
            <span className="text-[10px] text-gray-400 leading-none">
              Total Amount
            </span>
            <span className="text-lg font-extrabold text-gray-950 mt-1 leading-none">
              ₹{totalPrice.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handlePlaceOrderClick}
            className="bg-[#fb641b] text-white px-8 py-2.5 rounded-lg font-extrabold text-sm shadow-md active:scale-95 transition-all cursor-pointer outline-none focus:outline-none"
          >
            PLACE ORDER
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHECKOUT & MOCK PAYMENT GATEWAY MODAL OVERLAY */}
      {/* ========================================================================= */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-100 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#088178]" />
                  Secure Checkout
                </h3>
                <p className="text-[11px] text-gray-400 font-normal">Step {checkoutStep} of 4</p>
              </div>
              {checkoutStep !== 3 && (
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition cursor-pointer outline-none focus:outline-none"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 text-left">
              
              {/* STEP 1: SHIPPING ADDRESS FORM */}
              {checkoutStep === 1 && (
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="pb-2 border-b border-slate-100 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-[#088178]" />
                    <span className="text-sm font-semibold text-slate-700">Delivery Address Details</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-gray-400 uppercase font-semibold">Customer Name</label>
                      <input
                        type="text"
                        disabled
                        value={localUser?.name || ""}
                        className="w-full px-3 py-2 border border-slate-100 rounded-lg bg-slate-50 text-gray-450 text-xs font-medium cursor-not-allowed select-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-gray-400 uppercase font-semibold">Phone Number</label>
                      <input
                        type="text"
                        disabled
                        value={localUser?.phoneNumber || ""}
                        className="w-full px-3 py-2 border border-slate-100 rounded-lg bg-slate-50 text-gray-450 text-xs font-medium cursor-not-allowed select-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-gray-400 uppercase font-semibold">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="Flat/House No., Colony, Street"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-[#088178] focus:ring-2 focus:ring-[#088178]/10 text-xs font-semibold text-slate-800 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-gray-400 uppercase font-semibold">City</label>
                      <input
                        type="text"
                        required
                        placeholder="New Delhi"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-[#088178] focus:ring-2 focus:ring-[#088178]/10 text-xs font-semibold text-slate-800 outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-gray-400 uppercase font-semibold">State</label>
                      <input
                        type="text"
                        required
                        placeholder="Delhi"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-[#088178] focus:ring-2 focus:ring-[#088178]/10 text-xs font-semibold text-slate-800 outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-gray-400 uppercase font-semibold">Pincode</label>
                      <input
                        type="text"
                        required
                        placeholder="110001"
                        maxLength="6"
                        pattern="\d{6}"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value.replace(/\D/g, "") })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-[#088178] focus:ring-2 focus:ring-[#088178]/10 text-xs font-semibold text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#fb641b] text-white text-xs font-bold rounded-lg hover:bg-[#e05310] transition flex items-center gap-1 shadow-md shadow-[#fb641b]/10 cursor-pointer"
                    >
                      Proceed to Pay
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: PAYMENT METHOD SELECTION */}
              {checkoutStep === 2 && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-2">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Total Amount Due</span>
                      <span className="text-lg font-extrabold text-slate-900">₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                      Free Shipping
                    </span>
                  </div>

                  {/* Payment Method Toggle Tabs */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("UPI")}
                      className={`p-3.5 border rounded-xl flex items-center gap-2.5 transition-all duration-300 cursor-pointer text-left ${
                        paymentMethod === "UPI"
                          ? "border-[#088178] bg-[#088178]/5 ring-2 ring-[#088178]/10"
                          : "border-slate-200 hover:border-slate-350 bg-white"
                      }`}
                    >
                      <Smartphone className={`w-5 h-5 ${paymentMethod === "UPI" ? "text-[#088178]" : "text-slate-500"}`} />
                      <div>
                        <span className="block text-xs font-bold text-slate-800">UPI Payments</span>
                        <span className="text-[9px] text-gray-400">GPay, PhonePe, UPI ID</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("Card")}
                      className={`p-3.5 border rounded-xl flex items-center gap-2.5 transition-all duration-300 cursor-pointer text-left ${
                        paymentMethod === "Card"
                          ? "border-[#088178] bg-[#088178]/5 ring-2 ring-[#088178]/10"
                          : "border-slate-200 hover:border-slate-350 bg-white"
                      }`}
                    >
                      <CreditCard className={`w-5 h-5 ${paymentMethod === "Card" ? "text-[#088178]" : "text-slate-500"}`} />
                      <div>
                        <span className="block text-xs font-bold text-slate-800">Cards</span>
                        <span className="text-[9px] text-gray-400">Credit / Debit Cards</span>
                      </div>
                    </button>
                  </div>

                  {/* Option Specific Inner Panel */}
                  <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4.5 min-h-[140px] flex flex-col justify-center">
                    
                    {/* UPI Panel */}
                    {paymentMethod === "UPI" && (
                      <div className="space-y-3.5 w-full">
                        {/* App selects */}
                        <div className="flex items-center gap-2">
                          {["Google Pay", "PhonePe", "Paytm"].map((app) => (
                            <button
                              key={app}
                              onClick={() => {
                                setUpiApp(app);
                                setUpiId("");
                              }}
                              className={`px-3 py-1.5 border text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                                upiApp === app && !upiId
                                  ? "border-[#088178] bg-[#088178]/5 text-[#088178]"
                                  : "border-slate-200 bg-white text-slate-650 hover:bg-slate-50"
                              }`}
                            >
                              {app}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-xs my-2">
                          <span className="h-[1px] bg-slate-150 flex-1"></span>
                          <span>OR</span>
                          <span className="h-[1px] bg-slate-150 flex-1"></span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-gray-400 uppercase font-semibold">Enter UPI ID</label>
                          <input
                            type="text"
                            placeholder="username@upi"
                            value={upiId}
                            onChange={(e) => {
                              setUpiId(e.target.value);
                              setUpiApp("");
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#088178] transition-all bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Card Panel */}
                    {paymentMethod === "Card" && (
                      <div className="space-y-3 w-full">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-400 uppercase font-semibold">Cardholder Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Rahul Sharma"
                            value={cardDetails.holder}
                            onChange={(e) => setCardDetails({ ...cardDetails, holder: e.target.value })}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#088178] bg-white"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-400 uppercase font-semibold">Card Number</label>
                          <input
                            type="text"
                            required
                            placeholder="4532 7150 9324 8102"
                            value={cardDetails.number}
                            onChange={handleCardNumberChange}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#088178] bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-400 uppercase font-semibold">Expiry Date</label>
                            <input
                              type="text"
                              required
                              placeholder="MM/YY"
                              value={cardDetails.expiry}
                              onChange={handleExpiryChange}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#088178] bg-white text-center"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-400 uppercase font-semibold">CVV</label>
                            <input
                              type="password"
                              required
                              placeholder="***"
                              maxLength="3"
                              value={cardDetails.cvv}
                              onChange={handleCvvChange}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#088178] bg-white text-center"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(1)}
                      className="px-4 py-2 border border-slate-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePaymentSubmit}
                      className="px-8 py-2.5 bg-[#fb641b] text-white text-xs font-bold rounded-lg hover:bg-[#e05310] transition flex items-center gap-1 shadow-md shadow-[#fb641b]/10 cursor-pointer"
                    >
                      <Lock size={13} className="mr-0.5" />
                      Pay ₹{totalPrice.toLocaleString()} Now
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PROCESSING MOCK GATEWAY SCREEN */}
              {checkoutStep === 3 && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-5">
                  <div className="relative flex items-center justify-center">
                    {/* Ring Pulse Animations */}
                    <span className="absolute inline-flex h-24 w-24 rounded-full bg-[#088178]/5 animate-ping"></span>
                    <span className="absolute inline-flex h-20 w-20 rounded-full bg-[#088178]/10 animate-pulse"></span>
                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#088178] animate-spin"></div>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-slate-800">Processing Your Payment</h4>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider animate-pulse">
                      {processingMsg}
                    </p>
                    <p className="text-[10px] text-red-500 font-medium pt-1">
                      ⚠️ Please do not close this window or hit back/refresh.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4: PAYMENT SUCCESS & CONFIRMATION */}
              {checkoutStep === 4 && (
                <div className="py-6 flex flex-col items-center text-center space-y-6">
                  {/* Success Check circle animation */}
                  <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-500 text-green-500 flex items-center justify-center shadow-lg shadow-green-100 animate-bounce">
                    <Check size={36} strokeWidth={3} />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xl font-extrabold text-slate-800">Payment Successful!</h4>
                    <p className="text-xs text-gray-500">Thank you for your order. Your checkout is complete.</p>
                  </div>

                  {/* Transaction Metadata Display */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4.5 text-left w-full space-y-2 text-xs font-semibold text-slate-700">
                    <div className="flex justify-between pb-1.5 border-b border-slate-150/50">
                      <span className="text-gray-400 font-medium">Transaction ID</span>
                      <span className="font-mono text-slate-800 select-all">{generatedTxnId}</span>
                    </div>
                    {createdOrder && (
                      <div className="flex justify-between pb-1.5 border-b border-slate-150/50">
                        <span className="text-gray-400 font-medium">Order ID</span>
                        <span className="font-mono text-[#088178] font-bold">#{createdOrder._id}</span>
                      </div>
                    )}
                    <div className="flex justify-between pb-1.5 border-b border-slate-150/50">
                      <span className="text-gray-400 font-medium">Payment Method</span>
                      <span className="text-slate-800">{paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-medium">Amount Paid</span>
                      <span className="text-slate-900 font-bold">₹{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="w-full flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full bg-[#088178] hover:bg-[#06635c] text-white py-2.5 rounded-lg text-xs font-bold transition shadow-md shadow-[#088178]/10 cursor-pointer outline-none focus:outline-none"
                    >
                      Track Order on Profile Panel
                    </button>
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        navigate("/");
                      }}
                      className="w-full border border-slate-200 text-slate-700 hover:bg-slate-50 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer outline-none focus:outline-none"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
