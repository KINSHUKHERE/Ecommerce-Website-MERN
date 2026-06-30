import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Loader2, Lock, Smartphone, CreditCard, CheckSquare, Home, ShoppingBag, Shield, MapPin, ChevronDown } from "lucide-react";
import { getDataCart } from "../api/CartApi";
import { createOrder } from "../api/OrderApi";
import { getUserProfile } from "../api/AuthApi";
import { getAddresses, addAddress } from "../api/AddressApi";

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

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("manual");
  const [showSaveAddressPrompt, setShowSaveAddressPrompt] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

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

        // 3. Load Saved Addresses
        try {
          const addrRes = await getAddresses();
          const addrs = addrRes.data.addresses || [];
          setSavedAddresses(addrs);
          if (addrs.length > 0) {
            setSelectedAddressId(addrs[0]._id);
            setShippingAddress({
              address: addrs[0].streetAddress,
              city: addrs[0].city,
              state: addrs[0].state,
              postalCode: addrs[0].pinCode,
            });
          } else {
            setSelectedAddressId("manual");
          }
        } catch (addrErr) {
          console.error("Failed to load saved addresses during checkout:", addrErr);
        }

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

  const handleAddressSelect = (id) => {
    setSelectedAddressId(id);
    if (id === "manual") {
      setShippingAddress({
        address: "",
        city: "",
        state: "",
        postalCode: "",
      });
    } else {
      const selected = savedAddresses.find((a) => a._id === id);
      if (selected) {
        setShippingAddress({
          address: selected.streetAddress,
          city: selected.city,
          state: selected.state,
          postalCode: selected.pinCode,
        });
      }
    }
  };

  const handleSkipSaveAddress = () => {
    setShowSaveAddressPrompt(false);
    setCheckoutStep(2);
  };

  const handleSaveAndContinueAddress = async () => {
    try {
      await addAddress({
        streetAddress: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pinCode: shippingAddress.postalCode.trim(),
        country: "India"
      });
      showToast("Address saved to your address book", "success");
    } catch (err) {
      console.error("Failed to save manual address to book:", err);
      showToast(err.response?.data?.msg || "Could not save address, proceeding to payment", "error");
    }
    setShowSaveAddressPrompt(false);
    setCheckoutStep(2);
  };

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
    if (!shippingAddress.city.trim()) {
      showToast("Please enter your city");
      return;
    }
    if (!shippingAddress.state.trim()) {
      showToast("Please enter your state");
      return;
    }
    if (!shippingAddress.postalCode.trim()) {
      showToast("Please enter your postal code");
      return;
    }
    if (shippingAddress.postalCode.trim().length !== 6 || !/^\d+$/.test(shippingAddress.postalCode.trim())) {
      showToast("PIN / Postal Code must be a 6-digit number");
      return;
    }

    if (selectedAddressId === "manual") {
      setShowSaveAddressPrompt(true);
    } else {
      setCheckoutStep(2); // Go to Page 2 (Payment options)
    }
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
      <div className="flex-grow w-full bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#088178] w-10 h-10 mb-4" />
        <p className="text-sm text-gray-500 font-medium animate-pulse">Securing Connection...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full bg-soft-bg/30 py-12 text-dark-navy antialiased">
      <div className="max-w-2xl mx-auto px-6">
        
        {checkoutStep === 3 ? (
          <div className="max-w-2xl mx-auto p-8 bg-white border border-light-border/60 rounded-3xl shadow-sm text-center relative overflow-hidden animate-fadeIn">
            
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Check size={28} strokeWidth={3} className="animate-pulse" />
            </div>

            <h2 className="text-xl font-extrabold text-dark-navy tracking-tight mb-2">Thank You! Your Order has Been Placed</h2>
            <p className="text-xs text-muted-gray mt-2 leading-relaxed font-semibold">
              Your transaction has been verified successfully. A confirmation summary and delivery tracking status have been recorded.
            </p>

            <div className="my-6 p-5 bg-soft-bg border border-light-border/60 rounded-2xl text-xs font-semibold space-y-3 text-left">
              <div className="flex justify-between border-b border-light-border/40 pb-2.5">
                <span className="text-muted-gray">Transaction Reference ID</span>
                <span className="font-mono text-dark-navy select-all">{generatedTxnId}</span>
              </div>
              {createdOrder && (
                <div className="flex justify-between border-b border-light-border/40 pb-2.5">
                  <span className="text-muted-gray">Order Reference Number</span>
                  <span className="font-mono text-primary font-bold">#{createdOrder._id}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-light-border/40 pb-2.5">
                <span className="text-muted-gray">Payment Method</span>
                <span className="text-dark-navy">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-gray">Total Amount Paid</span>
                <span className="text-dark-navy font-bold text-sm">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* TWO ACTION BUTTONS (Home & Orders Section) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white py-3.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home size={14} />
                Continue Shopping
              </button>
              <button
                onClick={() => navigate("/profile", { state: { activeTab: "orders" } })}
                className="w-full border border-light-border text-dark-navy hover:bg-slate-50 py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
          <div className="max-w-2xl mx-auto p-8 bg-white border border-light-border/60 rounded-3xl shadow-2xs relative overflow-visible">

            {/* STEP 1: FORM DETAILS PAGE */}
            {checkoutStep === 1 && (
              <form onSubmit={handleProceedToPayment} className="space-y-6 text-left">
                {/* 1. Account Details Section */}
                <div className="space-y-3">
                  <h2 className="text-base font-extrabold text-dark-navy uppercase tracking-wider mb-4">
                    Verified Customer Account
                  </h2>
                  <div className="text-xs text-muted-gray font-semibold pl-1.5 space-y-1.5 leading-relaxed">
                    <p>Email: <span className="text-dark-navy font-bold">{localUser?.email}</span></p>
                    <p>Account Type: <span className="text-dark-navy font-bold capitalize">{localUser?.role || "user"}</span></p>
                  </div>
                </div>

                {/* Horizontal Line Separator */}
                <hr className="border-light-border/60" />

                {/* 2. Customer Inputs (Editable Name, Phone, and Address) */}
                <div className="space-y-5">
                  <h2 className="text-base font-extrabold text-dark-navy uppercase tracking-wider mb-6">
                    Delivery Destination Details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">Full Name (Recipient)</label>
                      <input
                        type="text"
                        required
                        id="checkout-name"
                        name="name"
                        autoComplete="name"
                        placeholder="Prachi Dogi"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full p-3 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-semibold text-dark-navy bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">Contact Mobile Number</label>
                      <input
                        type="text"
                        required
                        id="checkout-phone"
                        name="phone"
                        autoComplete="tel"
                        placeholder="9876543210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full p-3 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-semibold text-dark-navy bg-white"
                      />
                    </div>
                  </div>

                  {savedAddresses.length > 0 && (
                    <div className="space-y-3 mb-5 relative">
                      <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest block">Select Delivery Address</label>
                      <div className="relative">
                        {/* Trigger Button */}
                        <button
                          type="button"
                          onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                          className="w-full p-3.5 border border-light-border hover:border-muted-gray/50 rounded-2xl bg-white flex items-center justify-between text-left transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <MapPin className="text-primary mt-1 shrink-0" size={16} />
                            <div className="text-xs font-semibold text-dark-navy">
                              {selectedAddressId === "manual" ? (
                                <>
                                  <span className="font-extrabold text-dark-navy block">Type Address Manually</span>
                                  <span className="text-muted-gray block mt-0.5 font-normal">Enter a new shipping address for this order.</span>
                                </>
                              ) : (
                                (() => {
                                  const addr = savedAddresses.find((a) => a._id === selectedAddressId);
                                  if (addr) {
                                    return (
                                      <>
                                        <span className="font-extrabold text-dark-navy block">{addr.streetAddress}</span>
                                        <span className="text-muted-gray block mt-0.5 font-normal">
                                          {addr.city}, {addr.state} - {addr.pinCode} ({addr.country})
                                        </span>
                                      </>
                                    );
                                  }
                                  return <span className="font-bold text-dark-navy">Select an address</span>;
                                })()
                              )}
                            </div>
                          </div>
                          <ChevronDown className={`text-muted-gray transition-transform duration-200 shrink-0 ${showAddressDropdown ? 'rotate-180' : ''}`} size={18} />
                        </button>

                        {/* Backdrop for closing when clicking outside */}
                        {showAddressDropdown && (
                          <div 
                            className="fixed inset-0 z-10 cursor-default" 
                            onClick={() => setShowAddressDropdown(false)}
                          />
                        )}

                        {/* Dropdown Options List */}
                        {showAddressDropdown && (
                          <div className="absolute z-20 w-full mt-1.5 bg-white border border-light-border rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-light-border/40 animate-fadeIn">
                            {savedAddresses.map((addr) => (
                              <button
                                key={addr._id}
                                type="button"
                                onClick={() => {
                                  handleAddressSelect(addr._id);
                                  setShowAddressDropdown(false);
                                }}
                                className={`w-full p-3.5 flex items-start gap-3 text-left transition-all hover:bg-slate-50 cursor-pointer ${
                                  selectedAddressId === addr._id ? "bg-primary/5" : ""
                                }`}
                              >
                                <div className="mt-1 flex items-center justify-center w-4 h-4 rounded-full border border-light-border shrink-0 bg-white">
                                  {selectedAddressId === addr._id && <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />}
                                </div>
                                <div className="text-xs font-semibold text-dark-navy">
                                  <span className="font-extrabold text-dark-navy block">{addr.streetAddress}</span>
                                  <span className="text-muted-gray block mt-0.5 font-normal">
                                    {addr.city}, {addr.state} - {addr.pinCode} ({addr.country})
                                  </span>
                                </div>
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                handleAddressSelect("manual");
                                setShowAddressDropdown(false);
                              }}
                              className={`w-full p-3.5 flex items-start gap-3 text-left transition-all hover:bg-slate-50 cursor-pointer ${
                                selectedAddressId === "manual" ? "bg-primary/5" : ""
                              }`}
                            >
                              <div className="mt-1 flex items-center justify-center w-4 h-4 rounded-full border border-light-border shrink-0 bg-white">
                                {selectedAddressId === "manual" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                              </div>
                              <div className="text-xs font-semibold text-dark-navy">
                                <span className="font-extrabold text-dark-navy block">Type Address Manually</span>
                                <span className="text-muted-gray block mt-0.5 font-normal">
                                  Enter a new shipping address for this order.
                                </span>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedAddressId === "manual" && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">Street Address (Flat/House No., Colony)</label>
                        <input
                          type="text"
                          required
                          id="checkout-address"
                          name="address"
                          autoComplete="street-address"
                          placeholder="Flat/House No., Colony, Street, Apartment"
                          value={shippingAddress.address}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                          className="w-full p-3 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-semibold text-dark-navy bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">Town / City</label>
                          <input
                            type="text"
                            required
                            id="checkout-city"
                            name="city"
                            autoComplete="address-level2"
                            placeholder="New Delhi"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                            className="w-full p-3 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-semibold text-dark-navy bg-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">State / Province</label>
                          <input
                            type="text"
                            required
                            id="checkout-state"
                            name="state"
                            autoComplete="address-level1"
                            placeholder="Delhi"
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                            className="w-full p-3 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-semibold text-dark-navy bg-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">PIN / Postal Code</label>
                          <input
                            type="text"
                            required
                            id="checkout-pincode"
                            name="pincode"
                            autoComplete="postal-code"
                            placeholder="110001"
                            maxLength="6"
                            pattern="\d{6}"
                            value={shippingAddress.postalCode}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value.replace(/\D/g, "") })}
                            className="w-full p-3 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-semibold text-dark-navy bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action button: NEXT */}
                <div className="pt-6 border-t border-light-border flex items-center justify-end">
                  <button
                    type="submit"
                    className="w-full mt-4 py-4 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    Continue to Payment Options
                  </button>
                </div>

              </form>
            )}

            {/* STEP 2: PAYMENT INFO PAGE */}
            {checkoutStep === 2 && (
              <div className="space-y-6 text-left animate-fadeIn">
                <div className="flex flex-col gap-1.5 pb-5 border-b border-light-border/60">
                  <span className="text-xs text-muted-gray font-bold uppercase tracking-wider">Order Summary</span>
                  <span className="text-sm font-semibold text-muted-gray leading-relaxed">
                    Delivering to <span className="font-extrabold text-dark-navy">{customerName}</span> (Total Amount: <span className="font-extrabold text-dark-navy">₹{totalPrice.toLocaleString()}</span>)
                  </span>
                </div>

                {processing ? (
                  /* Processing simulated payment gateway loader */
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="animate-spin text-primary w-12 h-12" />
                    <div>
                      <h4 className="text-sm font-bold text-dark-navy">{processingMsg}</h4>
                      <p className="text-xs text-muted-gray mt-1 leading-relaxed font-medium">Simulating secure banking gateway transaction verification...</p>
                    </div>
                  </div>
                ) : (
                  /* Payment selectors */
                  <div className="space-y-6">
                    <h2 className="text-base font-extrabold text-dark-navy uppercase tracking-wider mb-6">
                      Choose your payment method
                    </h2>

                    {/* Radio Options: UPI, Card, COD */}
                    <div className="space-y-4">
                      
                      {/* Option UPI */}
                      <div className="space-y-3">
                        <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === "UPI"
                            ? "border-primary bg-primary/5"
                            : "border-light-border hover:border-muted-gray bg-white"
                        }`}>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="paymentOption"
                              checked={paymentMethod === "UPI"}
                              onChange={() => setPaymentMethod("UPI")}
                              className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                            />
                            <span className="ml-3 font-semibold text-dark-navy flex items-center gap-2 text-sm">
                              <Smartphone size={15} className="text-muted-gray" />
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
                                  className={`px-3 py-1.5 border text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    upiApp === app && !upiId
                                      ? "border-primary bg-primary/5 text-primary"
                                      : "border-light-border bg-white text-muted-gray hover:bg-slate-50"
                                  }`}
                                >
                                  {app}
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-col gap-1.5 max-w-xs">
                              <span className="text-xs font-extrabold text-muted-gray uppercase tracking-widest">Or Enter UPI ID</span>
                              <input
                                type="text"
                                id="checkout-upi"
                                name="upi-id"
                                autoComplete="off"
                                placeholder="username@upi"
                                value={upiId}
                                onChange={(e) => {
                                  setUpiId(e.target.value);
                                  setUpiApp("");
                                }}
                                className="w-full p-3 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-semibold text-dark-navy bg-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Option Cards */}
                      <div className="space-y-3">
                        <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === "Card"
                            ? "border-primary bg-primary/5"
                            : "border-light-border hover:border-muted-gray bg-white"
                        }`}>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="paymentOption"
                              checked={paymentMethod === "Card"}
                              onChange={() => setPaymentMethod("Card")}
                              className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                            />
                            <span className="ml-3 font-semibold text-dark-navy flex items-center gap-2 text-sm">
                              <CreditCard size={15} className="text-muted-gray" />
                              Credit or Debit Card (Secure Checkout via Visa, Mastercard, RuPay)
                            </span>
                          </div>
                        </label>
                        {paymentMethod === "Card" && (
                          <div className="px-4 pb-4 space-y-3.5 animate-fadeIn pl-8 max-w-sm">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-extrabold text-muted-gray uppercase tracking-widest">Cardholder Name</span>
                              <input
                                type="text"
                                id="checkout-cardholder"
                                name="ccname"
                                autoComplete="cc-name"
                                placeholder="Rahul Sharma"
                                value={cardDetails.holder}
                                onChange={(e) => setCardDetails({ ...cardDetails, holder: e.target.value })}
                                className="w-full p-3 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-semibold text-dark-navy bg-white"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-extrabold text-muted-gray uppercase tracking-widest">Card Number</span>
                              <input
                                type="text"
                                id="checkout-cardnumber"
                                name="cardnumber"
                                autoComplete="cc-number"
                                placeholder="4532 7150 9324 8102"
                                value={cardDetails.number}
                                onChange={handleCardNumberChange}
                                className="w-full p-3 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-semibold text-dark-navy bg-white"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3.5">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-extrabold text-muted-gray uppercase tracking-widest">Expiry (MM/YY)</span>
                                <input
                                  type="text"
                                  id="checkout-cardexpiry"
                                  name="cc-exp"
                                  autoComplete="cc-exp"
                                  placeholder="MM/YY"
                                  value={cardDetails.expiry}
                                  onChange={handleExpiryChange}
                                  className="w-full p-3 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-semibold text-dark-navy bg-white text-center"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-extrabold text-muted-gray uppercase tracking-widest">CVV</span>
                                <input
                                  type="password"
                                  id="checkout-cardcvv"
                                  name="cvv"
                                  autoComplete="cc-csc"
                                  placeholder="***"
                                  maxLength="3"
                                  value={cardDetails.cvv}
                                  onChange={handleCvvChange}
                                  className="w-full p-3 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-semibold text-dark-navy bg-white text-center"
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
                            ? "border-primary bg-primary/5"
                            : "border-light-border hover:border-muted-gray bg-white"
                        }`}>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="paymentOption"
                              checked={paymentMethod === "COD"}
                              onChange={() => setPaymentMethod("COD")}
                              className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                            />
                            <span className="ml-3 font-semibold text-dark-navy flex items-center gap-2 text-sm">
                              <CheckSquare size={15} className="text-muted-gray" />
                              Cash on Delivery (COD / Pay on Delivery)
                            </span>
                          </div>
                        </label>
                      </div>

                    </div>

                    <div className="pt-6 border-t border-light-border flex flex-col sm:flex-row gap-4 items-center justify-between mt-4">
                      <button
                        onClick={() => setCheckoutStep(1)}
                        className="px-5 py-4 border border-light-border text-muted-gray hover:bg-slate-50 font-bold rounded-xl transition-all w-full sm:w-auto cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleOrderSubmission}
                        className="w-full sm:flex-1 py-4 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                      >
                        Complete Secure Payment
                      </button>
                    </div>

                    {/* Trust-Building Reassuring Micro-copy */}
                    <div className="mt-6 p-4 bg-soft-bg border border-light-border/60 rounded-2xl text-xs text-muted-gray font-semibold space-y-2 max-w-lg leading-relaxed">
                      <p className="flex items-center gap-1.5 text-primary font-bold">
                        <Lock size={13} strokeWidth={2.5} />
                        <span>Bank-Grade Security Guarantee:</span>
                      </p>
                      <p className="pl-5 text-muted-gray font-normal">
                        All transaction details are encrypted using secure SSL 256-bit protocols. Your card credentials are never archived or stored on our servers.
                      </p>
                      <p className="flex items-start gap-1.5 pt-1 font-normal">
                        <Check size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" strokeWidth={3} />
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
      {/* MANUAL ADDRESS SAVE PROMPT MODAL */}
      {showSaveAddressPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-light-border rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl space-y-4 animate-scaleUp text-left">
            <div className="w-12 h-12 rounded-xl bg-accent-light border border-primary/10 text-primary flex items-center justify-center">
              <MapPin size={22} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-dark-navy">Save this address?</h3>
              <p className="text-xs text-muted-gray mt-2 leading-relaxed font-semibold">
                Would you like to save this new address to your address book for future orders? You can save up to 10 addresses.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkipSaveAddress}
                className="flex-1 py-2.5 border border-light-border text-muted-gray hover:bg-slate-50 font-bold text-xs rounded-xl transition cursor-pointer text-center"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleSaveAndContinueAddress}
                className="flex-1 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold text-xs rounded-xl transition cursor-pointer text-center"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert Widget */}
      {message && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 md:top-auto md:left-auto md:bottom-5 md:right-5 md:translate-x-0 z-50 bg-dark-navy border border-light-border/10 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn max-w-[90vw] w-max">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              toastType === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {toastType === "success" ? <Check size={12} /> : <X size={12} />}
          </div>
          <span className="font-semibold">{message}</span>
        </div>
      )}
    </div>
  );
};

export default Checkout;
