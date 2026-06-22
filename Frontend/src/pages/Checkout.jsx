import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2, Lock, Shield, CreditCard, Smartphone, CheckSquare } from "lucide-react";
import { getDataCart } from "../api/CartApi";
import { createOrder } from "../api/OrderApi";

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Checkout steps state
  const [activeStep, setActiveStep] = useState(2); // 1: Login (Auto-done), 2: Address, 3: Summary, 4: Payment
  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "New Delhi",
    state: "Delhi",
    postalCode: "110001",
  });

  // Payment Options state
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiApp, setUpiApp] = useState("Google Pay");
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  // Payment Processing & Success state
  const [processing, setProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState("Connecting to secure gateway...");
  const [success, setSuccess] = useState(false);
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
      
      // If cart is empty, redirect back to cart page (unless order was just placed successfully)
      if (formattedData.length === 0 && !success) {
        navigate("/cart");
      }
    } catch (err) {
      console.error("Error fetching checkout cart data", err);
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

  // Address Submit Handler
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
      alert("Please fill all address fields");
      return;
    }
    setIsAddressSaved(true);
    setActiveStep(3); // Move to Order Summary
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

  // Payment Confirmation / Place Order handler
  const handleConfirmOrder = () => {
    setProcessing(true);
    setProcessingMsg("Connecting to secure gateway...");
    const randomTxn = "TXN_" + Date.now() + Math.floor(100 + Math.random() * 900);
    setGeneratedTxnId(randomTxn);

    setTimeout(() => {
      setProcessingMsg("Authorizing payment transaction...");
    }, 900);

    setTimeout(() => {
      setProcessingMsg("Generating order receipt details...");
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
          paymentMethod: paymentMethod === "COD" ? "Card" : paymentMethod, // fallback to card/UPI or store COD as type
          transactionId: randomTxn,
        };

        const res = await createOrder(orderData);
        setCreatedOrder(res.data.order);
        setSuccess(true);
        setProcessing(false);
        // Dispatch event so navbar updates
        window.dispatchEvent(new Event("cartUpdated"));
      } catch (err) {
        console.error("Checkout order creation failed", err);
        alert("Payment was mock-successful, but recording order failed. Please retry.");
        setProcessing(false);
      }
    }, 2700);
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
      {/* minimal, clean header - no logos, no search, distraction-free checkout layout */}
      <header className="bg-[#2874f0] text-white py-3 px-4 sm:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-wide uppercase italic">Shopora Checkout</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-100">
            <Lock size={14} />
            <span>100% Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Body Grid */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-6 pb-24">
        {success ? (
          /* SUCCESS ORDER CONFIRMATION SCREEN */
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center max-w-xl mx-auto shadow-md">
            <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-500 text-green-500 flex items-center justify-center mx-auto mb-6">
              <Check size={36} strokeWidth={3} className="animate-pulse" />
            </div>

            <h2 className="text-2xl font-black text-slate-800">Order Confirmed!</h2>
            <p className="text-sm text-gray-500 mt-2">
              Your mock payment succeeded and your transaction was processed successfully.
            </p>

            <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs font-semibold text-slate-700 space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-gray-400">Transaction ID</span>
                <span className="font-mono text-slate-800 select-all">{generatedTxnId}</span>
              </div>
              {createdOrder && (
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-gray-400">Order Reference</span>
                  <span className="font-mono text-[#2874f0] font-bold">#{createdOrder._id}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-gray-400">Payment Option</span>
                <span className="text-slate-800">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount Charged</span>
                <span className="text-slate-900 font-extrabold text-sm">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate("/profile", { state: { activeTab: "orders" } })}
                className="w-full bg-[#fb641b] hover:bg-[#e05310] text-white py-2.5 rounded-lg text-xs font-bold transition shadow cursor-pointer outline-none focus:outline-none"
              >
                Track Orders & Deliveries
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full border border-slate-200 text-slate-700 hover:bg-slate-50 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer outline-none focus:outline-none"
              >
                Go to Home Screen
              </button>
            </div>
          </div>
        ) : (
          /* STANDARD FLIPKART 2-COLUMN CHECKOUT FLOW */
          <div className="grid lg:grid-cols-3 gap-4">
            
            {/* LEFT ACCORDION PANEL */}
            <div className="lg:col-span-2 space-y-3">
              
              {/* STEP 1: USER INFO (LOGIN) */}
              <div className="bg-white border border-gray-200 rounded-sm shadow-xs">
                <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <span className="w-5 h-5 bg-[#2874f0]/10 text-[#2874f0] font-bold text-xs rounded-sm flex items-center justify-center">1</span>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Login details</span>
                  </div>
                  <Check size={18} className="text-green-600" />
                </div>
                <div className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800">{localUser?.name} </span>
                    <span className="text-gray-400 font-normal">({localUser?.email || localUser?.phoneNumber})</span>
                  </div>
                </div>
              </div>

              {/* STEP 2: DELIVERY ADDRESS */}
              <div className="bg-white border border-gray-200 rounded-sm shadow-xs">
                <div className={`px-6 py-4 flex items-center justify-between border-b border-slate-100 ${activeStep === 2 ? "bg-[#2874f0] text-white" : "bg-slate-50/50"}`}>
                  <div className="flex items-center gap-4">
                    <span className={`w-5 h-5 font-bold text-xs rounded-sm flex items-center justify-center ${activeStep === 2 ? "bg-white text-[#2874f0]" : "bg-[#2874f0]/10 text-[#2874f0]"}`}>2</span>
                    <span className={`text-sm font-bold uppercase tracking-wide ${activeStep === 2 ? "text-white" : "text-slate-500"}`}>Delivery Address</span>
                  </div>
                  {isAddressSaved && activeStep !== 2 && <Check size={18} className="text-green-600" />}
                </div>

                {activeStep === 2 ? (
                  /* Form Fields Address (Normal & Simple Layout) */
                  <form onSubmit={handleAddressSubmit} className="p-6 space-y-4 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Recipient Name</label>
                        <input
                          type="text"
                          disabled
                          value={localUser?.name || ""}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-sm bg-slate-50 text-gray-450 text-xs font-semibold cursor-not-allowed select-none outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Contact Phone</label>
                        <input
                          type="text"
                          disabled
                          value={localUser?.phoneNumber || ""}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-sm bg-slate-50 text-gray-450 text-xs font-semibold cursor-not-allowed select-none outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-400 uppercase font-bold">Street Address</label>
                      <input
                        type="text"
                        required
                        placeholder="Flat, House No., Building, Company, Apartment, Street Address"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-sm focus:border-[#2874f0] text-xs font-semibold text-slate-800 outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">City</label>
                        <input
                          type="text"
                          required
                          placeholder="New Delhi"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-sm focus:border-[#2874f0] text-xs font-semibold text-slate-800 outline-none transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">State</label>
                        <input
                          type="text"
                          required
                          placeholder="Delhi"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-sm focus:border-[#2874f0] text-xs font-semibold text-slate-800 outline-none transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Pincode</label>
                        <input
                          type="text"
                          required
                          placeholder="110001"
                          maxLength="6"
                          pattern="\d{6}"
                          value={shippingAddress.postalCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value.replace(/\D/g, "") })}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-sm focus:border-[#2874f0] text-xs font-semibold text-slate-800 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-end">
                      <button
                        type="submit"
                        className="bg-[#fb641b] text-white hover:bg-[#e05310] px-8 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wide shadow transition-all cursor-pointer outline-none focus:outline-none"
                      >
                        Save and Deliver Here
                      </button>
                    </div>
                  </form>
                ) : (
                  isAddressSaved && (
                    <div className="px-6 py-4 text-left text-xs font-semibold text-slate-700 flex justify-between items-start gap-4">
                      <div>
                        <p className="font-bold text-slate-800">{localUser?.name} <span className="font-normal text-gray-500">Phone: {localUser?.phoneNumber}</span></p>
                        <p className="text-gray-500 mt-1 leading-relaxed">
                          {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveStep(2);
                          setIsAddressSaved(false);
                        }}
                        className="text-[#2874f0] hover:text-blue-800 font-bold uppercase tracking-wider text-[11px] cursor-pointer outline-none focus:outline-none border border-slate-200 px-3 py-1 rounded-sm bg-slate-50"
                      >
                        Change
                      </button>
                    </div>
                  )
                )}
              </div>

              {/* STEP 3: ORDER SUMMARY */}
              <div className="bg-white border border-gray-200 rounded-sm shadow-xs">
                <div className={`px-6 py-4 flex items-center justify-between border-b border-slate-100 ${activeStep === 3 ? "bg-[#2874f0] text-white" : "bg-slate-50/50"}`}>
                  <div className="flex items-center gap-4">
                    <span className={`w-5 h-5 font-bold text-xs rounded-sm flex items-center justify-center ${activeStep === 3 ? "bg-white text-[#2874f0]" : "bg-[#2874f0]/10 text-[#2874f0]"}`}>3</span>
                    <span className={`text-sm font-bold uppercase tracking-wide ${activeStep === 3 ? "text-white" : "text-slate-500"}`}>Order Summary</span>
                  </div>
                  {isAddressSaved && activeStep > 3 && <Check size={18} className="text-green-600" />}
                </div>

                {activeStep === 3 && (
                  <div className="p-6 text-left space-y-4">
                    {/* Cart Items listing */}
                    <div className="divide-y divide-slate-100 border border-slate-150/70 rounded-md p-2 bg-slate-50/30">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0 items-center justify-between">
                          <div className="flex gap-3 items-center min-w-0">
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-contain bg-white border border-slate-100 rounded p-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-[320px]">{item.name}</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-[#088178]">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-end">
                      <button
                        onClick={() => setActiveStep(4)}
                        className="bg-[#fb641b] text-white hover:bg-[#e05310] px-8 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wide shadow transition-all cursor-pointer outline-none focus:outline-none"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                )}

                {activeStep > 3 && (
                  <div className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700">
                    <p className="text-gray-500">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} Items ready to purchase.</p>
                  </div>
                )}
              </div>

              {/* STEP 4: PAYMENT OPTIONS */}
              <div className="bg-white border border-gray-200 rounded-sm shadow-xs">
                <div className={`px-6 py-4 flex items-center justify-between border-b border-slate-100 ${activeStep === 4 ? "bg-[#2874f0] text-white" : "bg-slate-50/50"}`}>
                  <div className="flex items-center gap-4">
                    <span className={`w-5 h-5 font-bold text-xs rounded-sm flex items-center justify-center ${activeStep === 4 ? "bg-white text-[#2874f0]" : "bg-[#2874f0]/10 text-[#2874f0]"}`}>4</span>
                    <span className={`text-sm font-bold uppercase tracking-wide ${activeStep === 4 ? "text-white" : "text-slate-500"}`}>Payment Options</span>
                  </div>
                </div>

                {activeStep === 4 && (
                  <div className="p-6 text-left">
                    {processing ? (
                      /* Processing Gate Simulation Layout */
                      <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                        <Loader2 className="animate-spin text-[#2874f0] w-12 h-12" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{processingMsg}</h4>
                          <p className="text-[10px] text-gray-400 mt-1">Verifying credentials and processing billing transaction...</p>
                        </div>
                      </div>
                    ) : (
                      /* Options list (Normal Radio Layout) */
                      <div className="space-y-4">
                        
                        {/* Option UPI */}
                        <div className="border border-slate-150 rounded-sm p-4 hover:bg-slate-50/30 transition-all">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="payment"
                              checked={paymentMethod === "UPI"}
                              onChange={() => setPaymentMethod("UPI")}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                <Smartphone size={14} className="text-slate-500" />
                                UPI (Google Pay, PhonePe, Paytm, or UPI ID)
                              </span>
                              
                              {paymentMethod === "UPI" && (
                                <div className="mt-4 pl-6 space-y-3 border-l-2 border-slate-200">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {["Google Pay", "PhonePe", "Paytm"].map((app) => (
                                      <button
                                        key={app}
                                        onClick={() => {
                                          setUpiApp(app);
                                          setUpiId("");
                                        }}
                                        className={`px-3 py-1 border text-[10px] font-bold rounded transition-all cursor-pointer ${
                                          upiApp === app && !upiId
                                            ? "border-[#2874f0] bg-[#2874f0]/5 text-[#2874f0]"
                                            : "border-slate-250 bg-white text-slate-650 hover:bg-slate-50"
                                        }`}
                                      >
                                        {app}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="flex flex-col gap-1 max-w-xs pt-1">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">Or Enter UPI ID</span>
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

                        {/* Option Card */}
                        <div className="border border-slate-150 rounded-sm p-4 hover:bg-slate-50/30 transition-all">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="payment"
                              checked={paymentMethod === "Card"}
                              onChange={() => setPaymentMethod("Card")}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                <CreditCard size={14} className="text-slate-500" />
                                Credit / Debit Card (Visa, Mastercard, RuPay)
                              </span>
                              
                              {paymentMethod === "Card" && (
                                <div className="mt-4 pl-6 space-y-3 border-l-2 border-slate-200 max-w-sm">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">Cardholder Name</span>
                                    <input
                                      type="text"
                                      placeholder="Rahul Sharma"
                                      value={cardDetails.holder}
                                      onChange={(e) => setCardDetails({ ...cardDetails, holder: e.target.value })}
                                      className="w-full px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2874f0] bg-white rounded-sm"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">Card Number</span>
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
                                      <span className="text-[9px] text-gray-400 font-bold uppercase">Expiry (MM/YY)</span>
                                      <input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={cardDetails.expiry}
                                        onChange={handleExpiryChange}
                                        className="w-full px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#2874f0] bg-white text-center rounded-sm"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[9px] text-gray-400 font-bold uppercase">CVV</span>
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

                        {/* Option Cash on Delivery (COD) */}
                        <div className="border border-slate-150 rounded-sm p-4 hover:bg-slate-50/30 transition-all">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="payment"
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

                        <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setActiveStep(3)}
                            className="px-4 py-2 border border-slate-200 text-gray-600 text-xs font-bold rounded-sm hover:bg-slate-50 transition cursor-pointer"
                          >
                            Back to Summary
                          </button>
                          <button
                            onClick={handleConfirmOrder}
                            className="bg-[#fb641b] text-white hover:bg-[#e05310] px-8 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wide shadow transition-all cursor-pointer outline-none focus:outline-none"
                          >
                            Confirm & Pay Now
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT SIDE SUMMARY BLOCK (Price Details) */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-sm p-5 text-left shadow-xs">
                <h2 className="text-xs font-bold text-gray-400 tracking-wider uppercase border-b border-gray-150 pb-3 mb-4">
                  Price Details
                </h2>

                <div className="space-y-3.5 text-xs font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Price ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="text-slate-800">₹{totalPrice.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Delivery Charges</span>
                    <span className="text-green-600 font-bold">FREE</span>
                  </div>

                  <hr className="border-gray-100 my-1" />

                  <div className="flex justify-between text-sm font-extrabold text-slate-900">
                    <span>Amount Payable</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Savings Notification */}
                <div className="mt-4 pt-3.5 border-t border-dashed border-slate-200 text-[11px] font-bold text-green-600 text-center">
                  ✨ Mock Checkout: Secure payment via local DB gateway.
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
