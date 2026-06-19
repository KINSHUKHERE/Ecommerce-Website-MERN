import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  getDataCart,
  increaseCart,
  decreaseCart,
  deleteCart,
} from "../api/CartApi";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
                    {/* Left Block: Image + Quantity Selector */}
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

                    {/* Right Block: Info & Price */}
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

                  {/* Action REMOVE Button */}
                  <div className="border-t border-gray-100 pt-3 mt-1">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-full flex justify-center items-center gap-1.5 py-1 text-xs sm:text-sm text-gray-600 hover:text-red-600 font-bold cursor-pointer"
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

              {/* Desktop view place order button */}
              <button className="hidden lg:block w-full mt-6 bg-[#fb641b] text-white py-3 rounded-lg font-extrabold hover:bg-[#e05310] transition shadow-md shadow-[#fb641b]/10 cursor-pointer active:scale-98">
                PLACE ORDER
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom place order action bar for mobile view */}
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

          <button className="bg-[#fb641b] text-white px-8 py-2.5 rounded-lg font-extrabold text-sm shadow-md active:scale-95 transition-all cursor-pointer">
            PLACE ORDER
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
