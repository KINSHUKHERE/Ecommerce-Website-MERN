import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Trash2,
  Check,
  X,
  ShoppingCart,
  Loader2,
  ArrowRight,
} from "lucide-react";
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

        const globalSaleConfig = (() => {
          try {
            const cached = sessionStorage.getItem("globalSaleConfig");
            return cached ? JSON.parse(cached) : null;
          } catch {
            return null;
          }
        })();
        const globalSaleActive = globalSaleConfig?.isGlobalSaleActive || false;

        const isItemOnSale = variant 
          ? (globalSaleActive && variant.onSale && variant.salePrice > 0)
          : (globalSaleActive && product.onSale && product.salePrice > 0);

        const price = variant 
          ? (isItemOnSale ? variant.salePrice : variant.price)
          : (isItemOnSale ? product.salePrice : (product.price || 0));

        const image =
          variant && variant.images && variant.images.length > 0
            ? variant.images[0]
            : product.imgUrl;

        const attributeString =
          variant && variant.attributes && variant.attributes.length > 0
            ? variant.attributes
                .map((attr) => `${attr.name}: ${attr.value}`)
                .join(", ")
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
      <div className="flex-grow w-full bg-soft-bg/30 p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-xs font-semibold text-muted-gray animate-pulse">
          Opening your cart...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full bg-soft-bg/30 px-3 sm:px-6 py-8 pb-28 lg:pb-12 text-dark-navy antialiased relative">
      {/* Toast Alert Widget */}
      {message && (
        <div className="fixed bottom-[90px] left-1/2 -translate-x-1/2 lg:bottom-5 lg:right-5 lg:left-auto lg:translate-x-0 z-50 bg-dark-navy border border-light-border/10 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn max-w-[90vw] w-max">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
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

      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl sm:text-3xl font-extrabold text-dark-navy tracking-tight mb-6 text-left border-b border-light-border/60 pb-4 flex items-center gap-2">
          Shopping Cart
          <span className="bg-slate-100 text-muted-gray text-xs font-extrabold px-3 py-0.5 rounded-full border border-light-border/20 ml-2 select-none">
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)} Items
          </span>
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white border border-light-border/60 rounded-3xl max-w-lg mx-auto shadow-2xs flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/5 rounded-full scale-125 blur-md animate-pulse"></div>
              <div className="relative w-20 h-20 bg-accent-light text-primary rounded-full flex items-center justify-center shadow-xs border border-primary/5">
                <ShoppingCart size={30} className="stroke-[2.5]" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-dark-navy tracking-tight">
              Your Cart is Empty
            </h2>
            <p className="text-muted-gray text-xs sm:text-sm mt-3 max-w-xs mx-auto leading-relaxed font-semibold">
              Looks like you haven't added anything to your cart yet. Explore
              our catalog to find items you love!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 mt-8 px-8 py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 cursor-pointer group"
            >
              Start Shopping
              <ArrowRight
                size={14}
                className="group-hover:translate-x-0.5 transition-transform duration-300 text-white/95"
              />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-8 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-light-border/60 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300"
                >
                  {/* Single row layout on mobile too */}
                  <div className="flex items-start gap-3">
                    {/* Product Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain bg-soft-bg/80 rounded-xl sm:rounded-2xl p-1 border border-light-border/30 flex-shrink-0"
                    />

                    {/* Details block */}
                    <div className="flex-1 min-w-0">
                      {/* Name */}
                      <h3 className="text-xs sm:text-sm font-extrabold text-dark-navy leading-snug line-clamp-2 hover:text-primary transition-colors">
                        {item.name}
                      </h3>

                      {/* Attributes pill */}
                      {item.attributes && (
                        <p className="text-[9px] sm:text-[10px] text-primary font-bold mt-1 bg-accent-light border border-primary/5 px-2 py-0.5 rounded-full w-fit">
                          {item.attributes}
                        </p>
                      )}

                      {/* Unit price */}
                      <p className="text-[10px] text-muted-gray font-semibold mt-1">
                        ₹{item.price.toLocaleString()} / unit
                      </p>

                      {/* Bottom row: Qty counter + subtotal + delete */}
                      <div className="flex items-center justify-between mt-2.5 gap-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-light-border rounded-xl bg-white overflow-hidden shadow-2xs h-7">
                          <button
                            onClick={() => handleDecrease(item.id)}
                            disabled={item.quantity <= 1 || updatingId !== null}
                            className={`w-7 h-full flex items-center justify-center text-muted-gray font-bold hover:bg-slate-50 active:bg-slate-100 transition-colors text-sm ${
                              item.quantity <= 1 || updatingId !== null
                                ? "opacity-30 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            −
                          </button>
                          <span className="px-2 font-bold text-xs text-dark-navy border-x border-light-border/40 min-w-[26px] h-full text-center flex items-center justify-center bg-white select-none">
                            {updatingId === item.id ? (
                              <Loader2
                                size={11}
                                className="animate-spin text-primary"
                              />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => handleIncrease(item.id)}
                            disabled={updatingId !== null}
                            className={`w-7 h-full flex items-center justify-center text-muted-gray font-bold hover:bg-slate-50 active:bg-slate-100 transition-colors text-sm ${
                              updatingId !== null
                                ? "opacity-30 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal + Delete */}
                        <div className="flex items-center gap-3 ml-auto">
                          <div className="text-right">
                            <span className="text-[8px] text-muted-gray uppercase block font-bold tracking-widest leading-none">
                              Subtotal
                            </span>
                            <span className="text-sm sm:text-base font-extrabold text-dark-navy leading-tight">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={updatingId !== null}
                            className={`transition-all p-2 rounded-xl hover:bg-rose-50 flex items-center justify-center outline-none focus:outline-none flex-shrink-0 ${
                              updatingId !== null
                                ? "text-slate-200 cursor-not-allowed"
                                : "text-muted-gray hover:text-red-500 cursor-pointer"
                            }`}
                            title="Remove item"
                          >
                            {updatingId === item.id ? (
                              <Loader2
                                size={15}
                                className="animate-spin text-red-500"
                              />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Summary Panel */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-light-border/60 p-4 sm:p-6 h-fit shadow-2xs text-left">
              <h2 className="text-[10px] font-extrabold text-muted-gray tracking-widest uppercase border-b border-light-border/60 pb-3 mb-4 select-none">
                Price Details
              </h2>

              <div className="space-y-3 text-xs font-semibold">
                <div className="flex justify-between text-muted-gray">
                  <span>
                    Price (
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    items)
                  </span>
                  <span className="text-dark-navy">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-muted-gray">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>

                <hr className="border-light-border/60 my-1" />

                <div className="flex justify-between text-sm sm:text-base font-extrabold text-dark-navy">
                  <span>Total Amount</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order Button — desktop only */}
              <button
                onClick={handlePlaceOrderClick}
                className="hidden lg:block w-full mt-6 py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 cursor-pointer outline-none"
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-light-border px-4 py-3.5 z-40 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
          <div className="text-left flex flex-col">
            <span className="text-[9px] text-muted-gray font-bold uppercase tracking-widest leading-none">
              Total Amount
            </span>
            <span className="text-base sm:text-lg font-extrabold text-dark-navy mt-1.5 leading-none">
              ₹{totalPrice.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handlePlaceOrderClick}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 cursor-pointer outline-none"
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
