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
      <div className="min-h-screen bg-[#f1f3f6] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#2874f0] w-10 h-10 mb-4" />
        <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Securing Connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      {/* Distraction-Free Header (Minimal & Solid, No logos or links) */}
      <header className="bg-[#2874f0] text-white py-3.5 px-4 sm:px-8 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-lg font-bold tracking-wide uppercase flex items-center gap-1.5">
            <Lock size={18} />
            Secure Checkout
          </span>
          <div className="flex items-center gap-1 text-xs text-blue-100 font-semibold">
            <Shield size={13} />
            <span>SSL SECURE 256-BIT ENCRYPTION</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        
        {/* ========================================================================= */}
        {/* STEP 3: PAYMENT SUCCESS CONFIRMATION PAGE */}
        {/* ========================================================================= */}
        {checkoutStep === 3 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-md animate-fadeIn text-left">
            <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-500 text-green-500 flex items-center justify-center mx-auto mb-6">
              <Check size={36} strokeWidth={3} className="animate-pulse" />
            </div>

            <h2 className="text-2xl font-black text-slate-800 text-center">Thank You! Your Order has Been Placed</h2>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Your transaction has been verified successfully. A confirmation summary and delivery tracking status have been recorded.
            </p>

            <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-gray-400">Transaction Reference ID</span>
                <span className="font-mono text-slate-800 select-all">{generatedTxnId}</span>
              </div>
              {createdOrder && (
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-gray-400">Order Reference Number</span>
                  <span className="font-mono text-[#2874f0] font-bold">#{createdOrder._id}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-gray-400">Payment Method</span>
                <span className="text-slate-800">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Amount Paid</span>
                <span className="text-slate-900 font-extrabold text-sm">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* TWO ACTION BUTTONS (Home & Orders Section) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/")}
                className="w-full bg-[#2874f0] hover:bg-blue-700 text-white py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer outline-none focus:outline-none"
              >
                <Home size={15} />
                Continue Shopping
              </button>
              <button
                onClick={() => navigate("/profile", { state: { activeTab: "orders" } })}
                className="w-full bg-[#fb641b] hover:bg-[#e05310] text-white py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer outline-none focus:outline-none"
              >
                <ShoppingBag size={15} />
                View Order Details & Status
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* FORM DETAILS (STEP 1 & STEP 2 PAGES) */
          /* ========================================================================= */
          <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-sm">
            
            {/* STEP 1: FORM DETAILS PAGE */}
            {checkoutStep === 1 && (
              <form onSubmit={handleProceedToPayment} className="space-y-5 text-left">
                {/* 1. Account Details Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles size={15} className="text-[#2874f0]" />
                    1. Verified Customer Account
                  </h3>
                  <div className="text-xs text-gray-500 font-semibold pl-1.5 space-y-1">
                    <p>Email: <span className="text-slate-800 font-bold">{localUser?.email}</span></p>
                    <p>Account Type: <span className="text-slate-800 font-bold capitalize">{localUser?.role || "user"}</span></p>
                  </div>
                </div>

                {/* Horizontal Line Separator */}
                <hr className="border-slate-200" />

                {/* 2. Customer Inputs (Editable Name, Phone, and Address) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wide">
                    2. Delivery Destination Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Full Name (Recipient)</label>
                      <input
                        type="text"
                        required
                        placeholder="Prachi Dogi"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-[#2874f0] text-xs font-semibold text-slate-800 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Contact Mobile Number</label>
                      <input
                        type="text"
                        required
                        placeholder="9876543210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-[#2874f0] text-xs font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Street Address (Flat/House No., Colony)</label>
                    <input
                      type="text"
                      required
                      placeholder="Flat/House No., Colony, Street, Apartment"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-[#2874f0] text-xs font-semibold text-slate-800 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Town / City</label>
                      <input
                        type="text"
                        required
                        placeholder="New Delhi"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-[#2874f0] text-xs font-semibold text-slate-800 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">State / Province</label>
                      <input
                        type="text"
                        required
                        placeholder="Delhi"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-[#2874f0] text-xs font-semibold text-slate-800 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">PIN / Postal Code</label>
                      <input
                        type="text"
                        required
                        placeholder="110001"
                        maxLength="6"
                        pattern="\d{6}"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value.replace(/\D/g, "") })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-[#2874f0] text-xs font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Action button: NEXT */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    className="bg-[#fb641b] text-white hover:bg-[#e05310] px-10 py-3 rounded-sm font-bold text-xs uppercase tracking-wide shadow cursor-pointer outline-none focus:outline-none"
                  >
                    Continue to Payment Options
                  </button>
                </div>

              </form>
            )}

            {/* STEP 2: PAYMENT INFO PAGE */}
            {checkoutStep === 2 && (
              <div className="space-y-5 text-left">
                <div className="flex flex-col gap-1 pb-3 border-b border-slate-100">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order Summary</span>
                  <span className="text-sm font-semibold text-slate-800">
                    Delivering to <span className="font-bold">{customerName}</span> (Total Amount: <span className="font-bold text-[#088178]">₹{totalPrice.toLocaleString()}</span>)
                  </span>
                </div>

                {processing ? (
                  /* Processing simulated payment gateway loader */
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="animate-spin text-[#2874f0] w-12 h-12" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{processingMsg}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">Simulating secure banking gateway transaction verification...</p>
                    </div>
                  </div>
                ) : (
                  /* Payment selectors */
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wide">
                      Choose Your Preferred Payment Method
                    </h3>

                    {/* Radio Options: UPI, Card, COD */}
                    <div className="space-y-3">
                      
                      {/* Option UPI */}
                      <div className="border border-slate-150 rounded-sm p-4 bg-slate-50/20">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentOption"
                            checked={paymentMethod === "UPI"}
                            onChange={() => setPaymentMethod("UPI")}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                              <Smartphone size={14} className="text-slate-500" />
                              Instant UPI Transfer (Google Pay, PhonePe, Paytm, or BHIM ID)
                            </span>
                            {paymentMethod === "UPI" && (
                              <div className="mt-4 pl-6 space-y-3 border-l-2 border-slate-200">
                                <div className="flex items-center gap-2">
                                  {["Google Pay", "PhonePe", "Paytm"].map((app) => (
                                    <button
                                      key={app}
                                      onClick={() => {
                                        setUpiApp(app);
                                        setUpiId("");
                                      }}
                                      className={`px-3 py-1 border text-[10px] font-bold rounded cursor-pointer ${
                                        upiApp === app && !upiId
                                          ? "border-[#2874f0] bg-[#2874f0]/5 text-[#2874f0]"
                                          : "border-slate-250 bg-white text-slate-650"
                                      }`}
                                    >
                                      {app}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex flex-col gap-1 max-w-xs pt-1">
                                  <span className="text-[9px] text-gray-400 font-bold">Or Enter UPI ID</span>
                                  <input
                                    type="text"
                                    placeholder="username@upi"
                                    value={upiId}
                                    onChange={(e) => {
                                      setUpiId(e.target.value);
                                      setUpiApp("");
                                    }}
                                    className="w-full px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2874f0] bg-white rounded-sm"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Option Cards */}
                      <div className="border border-slate-150 rounded-sm p-4 bg-slate-50/20">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentOption"
                            checked={paymentMethod === "Card"}
                            onChange={() => setPaymentMethod("Card")}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                              <CreditCard size={14} className="text-slate-500" />
                              Credit or Debit Card (Secure Checkout via Visa, Mastercard, RuPay)
                            </span>
                            {paymentMethod === "Card" && (
                              <div className="mt-4 pl-6 space-y-3 border-l-2 border-slate-200 max-w-sm">
                                <div className="flex flex-col gap-1">
                                  <span className="text-[9px] text-gray-400 font-bold">Cardholder Name</span>
                                  <input
                                    type="text"
                                    placeholder="Rahul Sharma"
                                    value={cardDetails.holder}
                                    onChange={(e) => setCardDetails({ ...cardDetails, holder: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2874f0] bg-white rounded-sm"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[9px] text-gray-400 font-bold">Card Number</span>
                                  <input
                                    type="text"
                                    placeholder="4532 7150 9324 8102"
                                    value={cardDetails.number}
                                    onChange={handleCardNumberChange}
                                    className="w-full px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2874f0] bg-white rounded-sm"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[9px] text-gray-400 font-bold">Expiry (MM/YY)</span>
                                    <input
                                      type="text"
                                      placeholder="MM/YY"
                                      value={cardDetails.expiry}
                                      onChange={handleExpiryChange}
                                      className="w-full px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2874f0] bg-white text-center rounded-sm"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[9px] text-gray-400 font-bold">CVV</span>
                                    <input
                                      type="password"
                                      placeholder="***"
                                      maxLength="3"
                                      value={cardDetails.cvv}
                                      onChange={handleCvvChange}
                                      className="w-full px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2874f0] bg-white text-center rounded-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Option Cash on Delivery */}
                      <div className="border border-slate-150 rounded-sm p-4 bg-slate-50/20">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentOption"
                            checked={paymentMethod === "COD"}
                            onChange={() => setPaymentMethod("COD")}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                              <CheckSquare size={14} className="text-slate-500" />
                              Cash on Delivery (COD / Pay on Delivery)
                            </span>
                          </div>
                        </label>
                      </div>

                    </div>

                    <div className="pt-5 border-t border-slate-100 mt-4 flex justify-between items-center">
                      <button
                        onClick={() => setCheckoutStep(1)}
                        className="px-4 py-2 border border-slate-200 text-gray-650 text-xs font-bold rounded-sm hover:bg-slate-50 transition cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleOrderSubmission}
                        className="bg-[#fb641b] text-white hover:bg-[#e05310] px-10 py-3 rounded-sm font-bold text-xs uppercase tracking-wide shadow transition-all cursor-pointer outline-none focus:outline-none"
                      >
                        Complete Secure Payment of ₹{totalPrice.toLocaleString()}
                      </button>
                    </div>

                    {/* Trust-Building Reassuring Micro-copy */}
                    <div className="mt-6 p-4 bg-slate-50 border border-slate-150 rounded-lg text-[10px] text-gray-500 font-semibold space-y-2 max-w-md">
                      <p className="flex items-center gap-1.5 text-[#088178]">
                        <Lock size={13} strokeWidth={2.5} />
                        <span><strong>Bank-Grade Security Guarantee:</strong> All payment details are encrypted using SSL 256-bit protocols. Your card numbers are never stored on our servers.</span>
                      </p>
                      <p className="flex items-start gap-1.5">
                        <Check size={13} className="text-green-600 mt-0.5 flex-shrink-0" strokeWidth={3} />
                        <span><strong>100% Secure Checkout:</strong> Complete buyer protection with easy refund options. A confirmation email and digital invoice will be dispatched immediately upon order validation.</span>
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
