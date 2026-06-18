import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProduct } from "../api/ProductApi";
import { sentToCart } from "../api/CartApi";

const EachProduct = ({ data }) => {
  const navigate = useNavigate();
  const productClicked = () => {
    navigate(`/products/${data._id}`);
  };

  if (!data) return null;
  const handleAddToCart = async (e) => {
    e.stopPropagation();

    try {
      const user = JSON.parse(localStorage.getItem("user"));

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

  return (
    <div>
      <div
        className="w-80 p-3 border border-[#cce7d0] rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 relative group bg-white cursor-pointer"
        onClick={productClicked}
      >
        <div className="w-full h-64 bg-[#f0f2f5] rounded-2xl p-4 flex justify-center items-center overflow-hidden">
          <img
            src={data.imgUrl}
            alt="Image Invalid"
            className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="pt-3 px-1 pb-1 flex flex-col gap-1.5 relative">
          <span className="text-s font-medium text-[#465B52] tracking-wider">
            {data.brandName}
          </span>

          <h5 className="font-bold text-[#1a1a1a] text-[15px] leading-tight truncate">
            {data.heading}
          </h5>

          <div className="flex justify-between items-center mt-1">
            <span className="font-bold text-[16px] text-[#088178]">
              ₹{data.price}
            </span>

            <button
              className="w-10 h-10 bg-[#e8f6ea] rounded-full flex justify-center items-center text-[#088178] hover:bg-[#088178] hover:text-white active:scale-90 transition-all duration-300 absolute bottom-0 right-0"
              onClick={handleAddToCart}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-shopping-cart"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EachProduct;
