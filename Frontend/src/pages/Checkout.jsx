import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2, Lock, Smartphone, CreditCard, CheckSquare, Sparkles, Home, ShoppingBag, Shield } from "lucide-react";
import { getDataCart } from "../api/CartApi";
import { createOrder } from "../api/OrderApi";

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

  const localUser = JSON.parse(localStorage.getItem("user"));

  const fetchCartData = async () => {
    if (!localUser) {
      navigate("/login");
      return;
    }

    try {
      const response = await getDataCart(localUser._id);
      const formattedData = response.data.cartData.map((item) => ({
        id: item._id,
        productId: item.productId._id,
        name: item.productId.heading,
        price: item.productId.price,
        quantity: item.quantity,
        image: item.productId.imgUrl,
      }));
      setCartItems(formattedData);

      // Pre-fill user information
      setCustomerName(localUser.name || "");
      setCustomerPhone(localUser.phoneNumber || "");

      // If cart is empty, redirect back (unless completed)
      if (formattedData.length === 0 && checkoutStep !== 3) {
        navigate("/cart");
      }
    } catch (err) {
      console.error("Error fetching cart for checkout", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // Form input validation for Page 1
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert("Please enter a recipient name");
      return;
    }
    if (!customerPhone.trim()) {
      alert("Please enter a contact phone number");
      return;
    }
    if (!shippingAddress.address.trim()) {
      alert("Please enter your street shipping address");
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
        alert("Mock payment succeeded, but database order creation failed. Please try again.");
        setProcessing(false);
      }
    }, 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#088178] w-10 h-10 mb-4" />
        <p className="text-sm text-gray-500 font-medium animate-pulse">Securing Connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 leading-normal">
      {/* Distraction-Free Header (Minimal, White backdrop-blur, Soft border) */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 py-4 px-4 sm:px-8 border-b border-slate-100">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wider text-slate-700 uppercase flex items-center gap-2">
            <Lock size={15} className="text-[#088178]" />
            Secure Checkout
          </span>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
            <Shield size={12} strokeWidth={2.5} />
            <span>SSL SECURE 256-BIT ENCRYPTION</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        
        {/* ========================================================================= */}
        {/* STEP 3: PAYMENT SUCCESS CONFIRMATION PAGE */}
        {/* ========================================================================= */}
        {checkoutStep === 3 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm shadow-slate-100/50 animate-fadeIn text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#088178]"></div>
            
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Check size={28} strokeWidth={3} className="animate-pulse" />
            </div>

            <h2 className="text-xl font-bold text-slate-800 text-center tracking-tight">Thank You! Your Order has Been Placed</h2>
            <p className="text-xs text-gray-500 mt-2 text-center leading-relaxed">
              Your transaction has been verified successfully. A confirmation summary and delivery tracking status have been recorded.
            </p>

            <div className="my-6 p-4.5 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-normal text-slate-700 space-y-3">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-gray-400 font-medium">Transaction Reference ID</span>
                <span className="font-mono text-slate-800 select-all font-semibold">{generatedTxnId}</span>
              </div>
              {createdOrder && (
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-gray-400 font-medium">Order Reference Number</span>
                  <span className="font-mono text-[#088178] font-bold">#{createdOrder._id}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-gray-400 font-medium">Payment Method</span>
                <span className="text-slate-800 font-semibold">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Total Amount Paid</span>
                <span className="text-slate-900 font-bold text-sm">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* TWO ACTION BUTTONS (Home & Orders Section) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/")}
                className="w-full bg-[#088178] hover:bg-[#06635c] text-white py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer outline-none focus:outline-none"
              >
                <Home size={14} />
                Continue Shopping
              </button>
              <button
                onClick={() => navigate("/profile", { state: { activeTab: "orders" } })}
                className="w-full border border-slate-200 text-slate-700 hover:bg-slate-50 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer outline-none focus:outline-none"
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
          <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm shadow-slate-100/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#088178]"></div>

            {/* STEP 1: FORM DETAILS PAGE */}
            {checkoutStep === 1 && (
              <form onSubmit={handleProceedToPayment} className="space-y-6 text-left">
                {/* 1. Account Details Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Sparkles size={16} className="text-[#088178]" />
                    1. Verified Customer Account
                  </h3>
                  <div className="text-xs text-gray-500 font-normal pl-1 space-y-1 leading-relaxed">
                    <p>Email: <span className="text-slate-800 font-semibold">{localUser?.email}</span></p>
                    <p>Account Type: <span className="text-slate-800 font-semibold capitalize">{localUser?.role || "user"}</span></p>
                  </div>
                </div>

                {/* Horizontal Line Separator */}
                <hr className="border-slate-100" />

                {/* 2. Customer Inputs (Editable Name, Phone, and Address) */}
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                    2. Delivery Destination Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-500 mb-0.5">Full Name (Recipient)</label>
                      <input
                        type="text"
                        required
                        placeholder="Prachi Dogi"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 text-sm font-normal text-slate-800 transition-all duration-300 outline-none h-[42px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-500 mb-0.5">Contact Mobile Number</label>
                      <input
                        type="text"
                        required
                        placeholder="9876543210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 text-sm font-normal text-slate-800 transition-all duration-300 outline-none h-[42px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-500 mb-0.5">Street Address (Flat/House No., Colony)</label>
                    <input
                      type="text"
                      required
                      placeholder="Flat/House No., Colony, Street, Apartment"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 text-sm font-normal text-slate-800 transition-all duration-300 outline-none h-[42px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-500 mb-0.5">Town / City</label>
                      <input
                        type="text"
                        required
                        placeholder="New Delhi"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 text-sm font-normal text-slate-800 transition-all duration-300 outline-none h-[42px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-500 mb-0.5">State / Province</label>
                      <input
                        type="text"
                        required
                        placeholder="Delhi"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 text-sm font-normal text-slate-800 transition-all duration-300 outline-none h-[42px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-500 mb-0.5">PIN / Postal Code</label>
                      <input
                        type="text"
                        required
                        placeholder="110001"
                        maxLength="6"
                        pattern="\d{6}"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value.replace(/\D/g, "") })}
                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 text-sm font-normal text-slate-800 transition-all duration-300 outline-none h-[42px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Action button: NEXT */}
                <div className="pt-5 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    className="bg-[#088178] hover:bg-[#06635c] text-white px-8 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all duration-300 transform active:scale-[0.98] cursor-pointer outline-none focus:outline-none"
                  >
                    Continue to Payment Options
                  </button>
                </div>

              </form>
            )}

            {/* STEP 2: PAYMENT INFO PAGE */}
            {checkoutStep === 2 && (
              <div className="space-y-6 text-left">
                <div className="flex flex-col gap-1.5 pb-4 border-b border-slate-100">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order Summary</span>
                  <span className="text-sm font-medium text-slate-700 leading-relaxed">
                    Delivering to <span className="font-bold text-slate-800">{customerName}</span> (Total Amount: <span className="font-bold text-[#088178]">₹{totalPrice.toLocaleString()}</span>)
                  </span>
                </div>

                {processing ? (
                  /* Processing simulated payment gateway loader */
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="animate-spin text-[#088178] w-12 h-12" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{processingMsg}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">Simulating secure banking gateway transaction verification...</p>
                    </div>
                  </div>
                ) : (
                  /* Payment selectors */
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                      Choose Your Preferred Payment Method
                    </h3>

                    {/* Radio Options: UPI, Card, COD */}
                    <div className="space-y-3">
                      
                      {/* Option UPI */}
                      <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/20">
                        <label className="flex items-start gap-3.5 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentOption"
                            checked={paymentMethod === "UPI"}
                            onChange={() => setPaymentMethod("UPI")}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <span className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                              <Smartphone size={15} className="text-slate-500" />
                              Instant UPI Transfer (Google Pay, PhonePe, Paytm, or BHIM ID)
                            </span>
                            {paymentMethod === "UPI" && (
                              <div className="mt-4 pl-6 space-y-3.5 border-l-2 border-slate-200">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {["Google Pay", "PhonePe", "Paytm"].map((app) => (
                                    <button
                                      key={app}
                                      onClick={() => {
                                        setUpiApp(app);
                                        setUpiId("");
                                      }}
                                      className={`px-3 py-1.5 border text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                                        upiApp === app && !upiId
                                          ? "border-[#088178] bg-[#088178]/5 text-[#088178]"
                                          : "border-slate-200 bg-white text-slate-650 hover:bg-slate-50"
                                      }`}
                                    >
                                      {app}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex flex-col gap-1.5 max-w-xs pt-1">
                                  <span className="text-[10px] text-gray-400 font-bold uppercase">Or Enter UPI ID</span>
                                  <input
                                    type="text"
                                    placeholder="username@upi"
                                    value={upiId}
                                    onChange={(e) => {
                                      setUpiId(e.target.value);
                                      setUpiApp("");
                                    }}
                                    className="w-full px-3 py-2 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#088178] bg-white rounded-lg h-[38px]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Option Cards */}
                      <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/20">
                        <label className="flex items-start gap-3.5 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentOption"
                            checked={paymentMethod === "Card"}
                            onChange={() => setPaymentMethod("Card")}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <span className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                              <CreditCard size={15} className="text-slate-500" />
                              Credit or Debit Card (Secure Checkout via Visa, Mastercard, RuPay)
                            </span>
                            {paymentMethod === "Card" && (
                              <div className="mt-4 pl-6 space-y-3.5 border-l-2 border-slate-200 max-w-sm">
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[10px] text-gray-400 font-bold uppercase">Cardholder Name</span>
                                  <input
                                    type="text"
                                    placeholder="Rahul Sharma"
                                    value={cardDetails.holder}
                                    onChange={(e) => setCardDetails({ ...cardDetails, holder: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#088178] bg-white rounded-lg h-[38px]"
                                  />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[10px] text-gray-400 font-bold uppercase">Card Number</span>
                                  <input
                                    type="text"
                                    placeholder="4532 7150 9324 8102"
                                    value={cardDetails.number}
                                    onChange={handleCardNumberChange}
                                    className="w-full px-3 py-2 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#088178] bg-white rounded-lg h-[38px]"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3.5">
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Expiry (MM/YY)</span>
                                    <input
                                      type="text"
                                      placeholder="MM/YY"
                                      value={cardDetails.expiry}
                                      onChange={handleExpiryChange}
                                      className="w-full px-3 py-2 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#088178] bg-white text-center rounded-lg h-[38px]"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">CVV</span>
                                    <input
                                      type="password"
                                      placeholder="***"
                                      maxLength="3"
                                      value={cardDetails.cvv}
                                      onChange={handleCvvChange}
                                      className="w-full px-3 py-2 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#088178] bg-white text-center rounded-lg h-[38px]"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Option Cash on Delivery */}
                      <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/20">
                        <label className="flex items-start gap-3.5 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentOption"
                            checked={paymentMethod === "COD"}
                            onChange={() => setPaymentMethod("COD")}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <span className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                              <CheckSquare size={15} className="text-slate-500" />
                              Cash on Delivery (COD / Pay on Delivery)
                            </span>
                          </div>
                        </label>
                      </div>

                    </div>

                    <div className="pt-5 border-t border-slate-100 mt-4 flex justify-between items-center">
                      <button
                        onClick={() => setCheckoutStep(1)}
                        className="px-4 py-2 border border-slate-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleOrderSubmission}
                        className="bg-[#088178] hover:bg-[#06635c] text-white px-8 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all duration-300 transform active:scale-[0.98] cursor-pointer outline-none focus:outline-none"
                      >
                        Complete Secure Payment of ₹{totalPrice.toLocaleString()}
                      </button>
                    </div>

                    {/* Trust-Building Reassuring Micro-copy */}
                    <div className="mt-6 p-4 bg-slate-50 border border-slate-150 rounded-xl text-[10px] text-gray-500 font-medium space-y-2 max-w-md">
                      <p className="flex items-center gap-1.5 text-[#088178] font-semibold">
                        <Lock size={13} strokeWidth={2.5} />
                        <span>Bank-Grade Security Guarantee:</span>
                      </p>
                      <p className="pl-5 text-gray-400 font-normal leading-relaxed">
                        All transaction details are encrypted using secure SSL 256-bit protocols. Your card credentials are never archived or stored on our servers.
                      </p>
                      <p className="flex items-start gap-1.5 pt-1">
                        <Check size={13} className="text-green-600 mt-0.5 flex-shrink-0" strokeWidth={3} />
                        <span><strong>Safe Shopping Assurance:</strong> 100% buyer protection guarantee. A confirmation receipt and live tracking link will be emailed to your account immediately.</span>
                      </p>
                    </div>

                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default Checkout;
