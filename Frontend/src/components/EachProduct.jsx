import React from "react";
import { useNavigate } from "react-router-dom";
import { deleteProduct, updateProduct } from "../api/ProductApi";
import { sentToCart } from "../api/CartApi";

const EachProduct = ({ data, onRefresh }) => {
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";
  const isOutOfStock = (data.quantity ?? 10) <= 0 || data.sold;

  const productClicked = () => {
    navigate(`/products/${data._id}`);
  };

  if (!data) return null;

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    try {
      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const cartData = {
        userId: user._id,
        productId: data._id,
        quantity: 1,
      };

      await sentToCart(cartData);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.log("Unable to add product to cart", err);
    }
  };

  const handleUpdateStock = async (e, newQty) => {
    e.stopPropagation();
    try {
      await updateProduct(data._id, { quantity: newQty, sold: newQty === 0 });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.log("Error updating stock quantity:", err);
    }
  };

  const handleToggleSold = async (e) => {
    e.stopPropagation();
    try {
      await updateProduct(data._id, { sold: !data.sold });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.log("Error toggling sold status:", err);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(data._id);
        if (onRefresh) onRefresh();
      } catch (err) {
        console.log("Error deleting product:", err);
      }
    }
  };

  const handleEditDetails = (e) => {
    e.stopPropagation();
    navigate(`/edit-product/${data._id}`);
  };

  return (
    <div
      className="w-full max-w-sm mx-auto p-2.5 sm:p-4 border border-[#cce7d0] rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 group bg-white cursor-pointer flex flex-col justify-between h-full"
      onClick={productClicked}
    >
      <div>
        <div className={`w-full h-36 sm:h-48 md:h-56 lg:h-60 bg-[#f0f2f5] rounded-xl sm:rounded-2xl p-2 sm:p-4 flex justify-center items-center overflow-hidden relative ${isOutOfStock ? "grayscale" : ""}`}>
          <img
            src={data.imgUrl}
            alt="Image Invalid"
            className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex justify-center items-center rounded-xl sm:rounded-2xl">
              <span className="bg-red-600 text-white font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-md uppercase tracking-wider shadow">
                SOLD OUT
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 sm:pt-3 px-1 pb-1 flex flex-col gap-1 sm:gap-1.5 text-left">
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">
              {data.categoryId?.name}
            </span>
            <span className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded ${
              isOutOfStock 
                ? "bg-red-50 text-red-600" 
                : (data.quantity ?? 10) <= 3 
                  ? "bg-amber-50 text-amber-600 animate-pulse" 
                  : "bg-green-50 text-green-600"
            }`}>
              {isOutOfStock ? "Sold Out" : `${data.quantity ?? 10} Left`}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-[#465B52] mt-0.5">
              {data.variantId?.name}
            </span>
          </div>

          <h5 className="font-bold text-[#1a1a1a] text-[13px] sm:text-[15px] leading-tight line-clamp-1 mt-0.5">
            {data.heading}
          </h5>

          {data.description && (
            <p className="text-[11px] sm:text-[13px] text-gray-600 line-clamp-2 mt-1 leading-snug">
              {data.description}
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mt-2.5 sm:mt-4 pt-2 border-t border-gray-50 px-1">
          <span className="font-extrabold text-[14px] sm:text-[16px] text-[#088178]">
            ₹{data.price}
          </span>

          <button
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex justify-center items-center transition-all duration-300 flex-shrink-0 ${
              isOutOfStock
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#e8f6ea] text-[#088178] hover:bg-[#088178] hover:text-white active:scale-90 cursor-pointer"
            }`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="sm:w-[18px] sm:h-[18px]"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </button>
        </div>

        {/* Admin Actions Bar */}
        {isAdmin && (
          <div className="border-t border-gray-150 pt-2.5 mt-2.5 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold text-gray-500">Edit Qty:</span>
              <div className="flex items-center border border-gray-300 rounded bg-white">
                <button
                  onClick={(e) => handleUpdateStock(e, (data.quantity ?? 10) - 1)}
                  disabled={(data.quantity ?? 10) <= 0}
                  className="px-2 py-0.5 text-xs text-gray-600 font-bold hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  -
                </button>
                <span className="px-2.5 text-xs font-semibold text-gray-800 border-x border-gray-200 min-w-[20px] text-center">
                  {data.quantity ?? 10}
                </span>
                <button
                  onClick={(e) => handleUpdateStock(e, (data.quantity ?? 10) + 1)}
                  className="px-2 py-0.5 text-xs text-gray-600 font-bold hover:bg-gray-100 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleToggleSold}
                className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  data.sold
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                }`}
              >
                {data.sold ? "In Stock" : "Mark Sold"}
              </button>
              
              <button
                onClick={handleEditDetails}
                className="py-1.5 px-2.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-[11px] font-bold flex items-center justify-center cursor-pointer"
              >
                Edit
              </button>
              
              <button
                onClick={handleDelete}
                className="py-1.5 px-2.5 bg-red-100 text-red-700 hover:bg-red-200 rounded text-[11px] font-bold flex items-center justify-center cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EachProduct;
