import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Loader2, Lock, Smartphone, CreditCard, CheckSquare, Sparkles, Home, ShoppingBag, Shield } from "lucide-react";
import { getDataCart } from "../api/CartApi";
import { createOrder } from "../api/OrderApi";
import { getUserProfile } from "../api/AuthApi";

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Flow step control (1: Address/Summary form, 2: Payment details selection, 3: Success screen)
  const [checkoutStep, setCheckoutStep] = useState(1);

  // Page 1 Form details (Editable)
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "New Delhi",
    state: "Delhi",
    postalCode: "110001",
  });

  // Page 2 Payment Options state
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiApp, setUpiApp] = useState("Google Pay");
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  // Processing & Success State
  const [processing, setProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState("Connecting to secure gateway...");
  const [generatedTxnId, setGeneratedTxnId] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("error");

  const showToast = (msg, type = "error") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const localUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!localUser) {
      navigate("/login");
      return;
    }

    const verifyAndLoad = async () => {
      try {
        // 1. Verify user profile has phone number and password
        const profileRes = await getUserProfile();
        const userObj = profileRes.data;
        localStorage.setItem("user", JSON.stringify(userObj));

        const hasPhone = userObj.phoneNumber && userObj.phoneNumber.trim() !== "";
        const hasPwd = userObj.hasPassword === true;

        if (!hasPhone || !hasPwd) {
          let msg = "";
          if (!hasPhone && !hasPwd) {
            msg = "Please set up your Phone Number and Password in your Profile before placing an order.";
          } else if (!hasPhone) {
            msg = "Please set up your Phone Number in your Profile before placing an order.";
          } else {
            msg = "Please set up a Password in your Profile before placing an order.";
          }
          navigate("/profile", { replace: true, state: { alertMsg: msg } });
          return;
        }

        // 2. Load Cart Data
        const response = await getDataCart();
        const formattedData = response.data.cartData.map((item) => {
          const variant = item.variantId;
          const product = item.productId;
          
          const price = variant ? variant.price : (product.price || 0);
          const image = (variant && variant.images && variant.images.length > 0)
            ? variant.images[0]
            : product.imgUrl;

          return {
            id: item._id,
            productId: product._id,
            variantId: variant ? variant._id : "",
            name: product.heading,
            price,
            quantity: item.quantity,
            image,
          };
        });
        setCartItems(formattedData);

        // Pre-fill user information
        setCustomerName(userObj.name || "");
        setCustomerPhone(userObj.phoneNumber || "");

        // If cart is empty, redirect back (unless completed)
        if (formattedData.length === 0 && checkoutStep !== 3) {
          navigate("/cart");
        }
      } catch (err) {
        console.error("Error during checkout initialization", err);
      } finally {
        setLoading(false);
      }
    };

    verifyAndLoad();
  }, [navigate, checkoutStep]);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // Form input validation for Page 1
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast("Please enter a recipient name");
      return;
    }
    if (!customerPhone.trim()) {
      showToast("Please enter a contact phone number");
      return;
    }
    if (!shippingAddress.address.trim()) {
      showToast("Please enter your street shipping address");
      return;
    }
    setCheckoutStep(2); // Go to Page 2 (Payment options)
  };

  // Card input formatting helpers
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

  // Payment Confirmation & Order creation API trigger
  const handleOrderSubmission = () => {
    setProcessing(true);
    setProcessingMsg("Processing your payment gateway...");
    const randomTxn = "TXN_" + Date.now() + Math.floor(100 + Math.random() * 900);
    setGeneratedTxnId(randomTxn);

    setTimeout(() => {
      setProcessingMsg("Authorizing bank transaction...");
    }, 1000);

    setTimeout(async () => {
      try {
        const orderData = {
          userId: localUser._id,
          items: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
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
          paymentMethod: paymentMethod === "COD" ? "Card" : paymentMethod,
          transactionId: randomTxn,
        };

        const res = await createOrder(orderData);
        setCreatedOrder(res.data.order);
        setCheckoutStep(3); // Success Screen
        setProcessing(false);
        window.dispatchEvent(new Event("cartUpdated"));
      } catch (err) {
        console.error("Failed to place checkout order", err);
        showToast("Mock payment succeeded, but database order creation failed. Please try again.");
        setProcessing(false);
      }
    }, 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#088178] w-10 h-10 mb-4" />
        <p className="text-sm text-gray-500 font-medium animate-pulse">Securing Connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 font-sans antialiased text-slate-800 leading-relaxed">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        
        {/* ========================================================================= */}
        {/* STEP 3: PAYMENT SUCCESS CONFIRMATION PAGE */}
        {/* ========================================================================= */}
        {checkoutStep === 3 ? (
          <div className="max-w-2xl mx-auto p-8 bg-white border border-gray-100 rounded-2xl shadow-sm text-center relative overflow-hidden animate-fadeIn text-left">
            
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-250 text-emerald-650 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Check size={28} strokeWidth={3} className="animate-pulse" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900 text-center tracking-tight mb-2">Thank You! Your Order has Been Placed</h2>
            <p className="text-xs text-gray-500 mt-2 text-center leading-relaxed">
              Your transaction has been verified successfully. A confirmation summary and delivery tracking status have been recorded.
            </p>

            <div className="my-6 p-5 bg-gray-50/55 border border-gray-100 rounded-xl text-xs font-normal text-gray-750 space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2.5">
                <span className="text-gray-400 font-medium">Transaction Reference ID</span>
                <span className="font-mono text-gray-900 select-all font-semibold">{generatedTxnId}</span>
              </div>
              {createdOrder && (
                <div className="flex justify-between border-b border-gray-100 pb-2.5">
                  <span className="text-gray-400 font-medium">Order Reference Number</span>
                  <span className="font-mono text-indigo-600 font-bold">#{createdOrder._id}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-gray-100 pb-2.5">
                <span className="text-gray-400 font-medium">Payment Method</span>
                <span className="text-gray-900 font-semibold">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Total Amount Paid</span>
                <span className="text-gray-950 font-bold text-sm">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* TWO ACTION BUTTONS (Home & Orders Section) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home size={14} />
                Continue Shopping
              </button>
              <button
                onClick={() => navigate("/profile", { state: { activeTab: "orders" } })}
                className="w-full border border-gray-250 text-gray-700 hover:bg-gray-50 py-3.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag size={14} />
                View Order Details & Status
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* FORM DETAILS (STEP 1 & STEP 2 PAGES) */
          /* ========================================================================= */
          <div className="max-w-2xl mx-auto p-8 bg-white border border-gray-100 rounded-2xl shadow-sm relative overflow-hidden">

            {/* STEP 1: FORM DETAILS PAGE */}
            {checkoutStep === 1 && (
              <form onSubmit={handleProceedToPayment} className="space-y-6 text-left">
                {/* 1. Account Details Section */}
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight flex items-center gap-2">
                    <Sparkles size={18} className="text-gray-400" />
                    Verified Customer Account
                  </h2>
                  <div className="text-sm text-gray-600 font-normal pl-1.5 space-y-1.5 leading-relaxed">
                    <p>Email: <span className="text-gray-950 font-medium">{localUser?.email}</span></p>
                    <p>Account Type: <span className="text-gray-950 font-medium capitalize">{localUser?.role || "user"}</span></p>
                  </div>
                </div>

                {/* Horizontal Line Separator */}
                <hr className="border-gray-100" />

                {/* 2. Customer Inputs (Editable Name, Phone, and Address) */}
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 tracking-tight">
                    Delivery Destination Details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700 mb-1">Full Name (Recipient)</label>
                      <input
                        type="text"
                        required
                        placeholder="Prachi Dogi"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-normal text-gray-900 bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700 mb-1">Contact Mobile Number</label>
                      <input
                        type="text"
                        required
                        placeholder="9876543210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-normal text-gray-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700 mb-1">Street Address (Flat/House No., Colony)</label>
                    <input
                      type="text"
                      required
                      placeholder="Flat/House No., Colony, Street, Apartment"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-normal text-gray-900 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700 mb-1">Town / City</label>
                      <input
                        type="text"
                        required
                        placeholder="New Delhi"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-normal text-gray-900 bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700 mb-1">State / Province</label>
                      <input
                        type="text"
                        required
                        placeholder="Delhi"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-normal text-gray-900 bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700 mb-1">PIN / Postal Code</label>
                      <input
                        type="text"
                        required
                        placeholder="110001"
                        maxLength="6"
                        pattern="\d{6}"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value.replace(/\D/g, "") })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-normal text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Action button: NEXT */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-end">
                  <button
                    type="submit"
                    className="w-full mt-8 py-4 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Continue to Payment Options
                  </button>
                </div>

              </form>
            )}

            {/* STEP 2: PAYMENT INFO PAGE */}
            {checkoutStep === 2 && (
              <div className="space-y-6 text-left animate-fadeIn">
                <div className="flex flex-col gap-1.5 pb-5 border-b border-gray-100">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order Summary</span>
                  <span className="text-sm font-medium text-gray-700 leading-relaxed">
                    Delivering to <span className="font-bold text-gray-900">{customerName}</span> (Total Amount: <span className="font-bold text-gray-950">₹{totalPrice.toLocaleString()}</span>)
                  </span>
                </div>

                {processing ? (
                  /* Processing simulated payment gateway loader */
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{processingMsg}</h4>
                      <p className="text-xs text-gray-450 mt-1 leading-relaxed">Simulating secure banking gateway transaction verification...</p>
                    </div>
                  </div>
                ) : (
                  /* Payment selectors */
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 tracking-tight">
                      Choose your payment method
                    </h2>

                    {/* Radio Options: UPI, Card, COD */}
                    <div className="space-y-4">
                      
                      {/* Option UPI */}
                      <div className="space-y-3">
                        <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === "UPI"
                            ? "border-indigo-600 bg-indigo-50/50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="paymentOption"
                              checked={paymentMethod === "UPI"}
                              onChange={() => setPaymentMethod("UPI")}
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-3 font-medium text-gray-900 flex items-center gap-2">
                              <Smartphone size={15} className="text-gray-400" />
                              Instant UPI Transfer (Google Pay, PhonePe, Paytm, or BHIM ID)
                            </span>
                          </div>
                        </label>
                        {paymentMethod === "UPI" && (
                          <div className="px-4 pb-4 space-y-3.5 animate-fadeIn pl-8">
                            <div className="flex items-center gap-2 flex-wrap">
                              {["Google Pay", "PhonePe", "Paytm"].map((app) => (
                                <button
                                  key={app}
                                  onClick={() => {
                                    setUpiApp(app);
                                    setUpiId("");
                                  }}
                                  className={`px-3 py-1.5 border text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                    upiApp === app && !upiId
                                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold"
                                      : "border-gray-200 bg-white text-gray-650 hover:bg-gray-50"
                                  }`}
                                >
                                  {app}
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-col gap-1.5 max-w-xs">
                              <span className="text-xs font-medium text-gray-500">Or Enter UPI ID</span>
                              <input
                                type="text"
                                placeholder="username@upi"
                                value={upiId}
                                onChange={(e) => {
                                  setUpiId(e.target.value);
                                  setUpiApp("");
                                }}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-normal text-gray-900 bg-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Option Cards */}
                      <div className="space-y-3">
                        <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === "Card"
                            ? "border-indigo-600 bg-indigo-50/50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="paymentOption"
                              checked={paymentMethod === "Card"}
                              onChange={() => setPaymentMethod("Card")}
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-3 font-medium text-gray-900 flex items-center gap-2">
                              <CreditCard size={15} className="text-gray-400" />
                              Credit or Debit Card (Secure Checkout via Visa, Mastercard, RuPay)
                            </span>
                          </div>
                        </label>
                        {paymentMethod === "Card" && (
                          <div className="px-4 pb-4 space-y-3.5 animate-fadeIn pl-8 max-w-sm">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-medium text-gray-500">Cardholder Name</span>
                              <input
                                type="text"
                                placeholder="Rahul Sharma"
                                value={cardDetails.holder}
                                onChange={(e) => setCardDetails({ ...cardDetails, holder: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-normal text-gray-900 bg-white"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-medium text-gray-500">Card Number</span>
                              <input
                                type="text"
                                placeholder="4532 7150 9324 8102"
                                value={cardDetails.number}
                                onChange={handleCardNumberChange}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-normal text-gray-900 bg-white"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3.5">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-gray-500">Expiry (MM/YY)</span>
                                <input
                                  type="text"
                                  placeholder="MM/YY"
                                  value={cardDetails.expiry}
                                  onChange={handleExpiryChange}
                                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-normal text-gray-900 bg-white text-center"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-gray-500">CVV</span>
                                <input
                                  type="password"
                                  placeholder="***"
                                  maxLength="3"
                                  value={cardDetails.cvv}
                                  onChange={handleCvvChange}
                                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-normal text-gray-900 bg-white text-center"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Option Cash on Delivery */}
                      <div className="space-y-3">
                        <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === "COD"
                            ? "border-indigo-600 bg-indigo-50/50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="paymentOption"
                              checked={paymentMethod === "COD"}
                              onChange={() => setPaymentMethod("COD")}
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-3 font-medium text-gray-900 flex items-center gap-2">
                              <CheckSquare size={15} className="text-gray-400" />
                              Cash on Delivery (COD / Pay on Delivery)
                            </span>
                          </div>
                        </label>
                      </div>

                    </div>

                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between mt-4">
                      <button
                        onClick={() => setCheckoutStep(1)}
                        className="px-5 py-4 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all w-full sm:w-auto cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleOrderSubmission}
                        className="w-full sm:flex-1 py-4 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Complete Secure Payment
                      </button>
                    </div>

                    {/* Trust-Building Reassuring Micro-copy */}
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500 font-normal space-y-2 max-w-lg leading-relaxed">
                      <p className="flex items-center gap-1.5 text-indigo-600 font-semibold">
                        <Lock size={13} strokeWidth={2.5} />
                        <span>Bank-Grade Security Guarantee:</span>
                      </p>
                      <p className="pl-5 text-gray-500">
                        All transaction details are encrypted using secure SSL 255-bit protocols. Your card credentials are never archived or stored on our servers.
                      </p>
                      <p className="flex items-start gap-1.5 pt-1">
                        <Check size={13} className="text-green-600 mt-0.5 flex-shrink-0" strokeWidth={3} />
                        <span><strong>Safe Shopping Assurance:</strong> 100% buyer protection guarantee. A confirmation receipt and live tracking link will be recorded on your profile immediately.</span>
                      </p>
                    </div>

                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
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
    </div>
  );
};

export default Checkout;
