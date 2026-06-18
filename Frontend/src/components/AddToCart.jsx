import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  getDataCart,
  increaseCart,
  decreaseCart,
  deleteCart,
} from "../api/CartApi";

const AddToCart = () => {
  const [cartItems, setCartItems] = useState([]);

  const fetchCartData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <h2 className="text-2xl font-semibold text-gray-600">
            Your Cart is Empty 🛒
          </h2>

          <p className="text-gray-500 mt-2">Add products to see them here.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-5">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md p-5 flex flex-col md:flex-row items-center gap-5"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{item.name}</h2>

                  <p className="text-[#15877F] font-bold text-lg mt-2">
                    ₹{item.price.toLocaleString()}
                  </p>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => handleDecrease(item.id)}
                      className="bg-gray-200 px-3 py-1 rounded"
                    >
                      -
                    </button>

                    <span className="font-semibold">{item.quantity}</span>

                    <button
                      onClick={() => handleIncrease(item.id)}
                      className="bg-gray-200 px-3 py-1 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 mt-4 hover:text-red-700"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-md p-6 h-fit">
            <h2 className="text-2xl font-bold mb-5">Order Summary</h2>

            <div className="flex justify-between mb-3">
              <span>Items</span>
              <span>{cartItems.length}</span>
            </div>

            <div className="flex justify-between mb-3">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>₹{totalPrice.toLocaleString()}</span>
            </div>

            <button className="w-full mt-6 bg-[#15877F] text-white py-3 rounded-lg hover:bg-[#126b64] transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddToCart;
