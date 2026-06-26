import React from "react";
import { useNavigate } from "react-router-dom";
import { sentToCart } from "../api/CartApi";

const EachProduct = ({ data }) => {
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem("user"));
  const isOutOfStock = (data.quantity ?? 10) <= 0 || data.sold;

  const productClicked = () => {
    navigate(`/products/${data._id}`);
  };

  if (!data) return null;

  const [adding, setAdding] = React.useState(false);
  const [toast, setToast] = React.useState("");

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    try {
      if (!user) {
        navigate("/login");
        return;
      }

      setAdding(true);
      const cartData = {
        userId: user._id,
        productId: data._id,
        quantity: 1,
      };

      await sentToCart(cartData);
      window.dispatchEvent(new Event("cartUpdated"));
      
      setToast(`"${data.heading}" added to cart!`);
      setTimeout(() => {
        setToast("");
      }, 2500);
    } catch (err) {
      console.log("Unable to add product to cart", err);
    } finally {
      setAdding(false);
    }
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
              {data.brandId?.name}
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
            disabled={isOutOfStock || adding}
          >
            {adding ? (
              <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
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
            )}
          </button>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900/95 border border-gray-800 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {toast}
        </div>
      )}
    </div>
  );
};

export default EachProduct;
