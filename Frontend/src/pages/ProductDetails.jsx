import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/ProductApi";
import { sentToCart } from "../api/CartApi";

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);
  const fetchProducts = async () => {
    try {
      const res = await getProduct();
      const selectedProduct = res.data.data.find(
        (item) => item._id === productId,
      );

      setProduct(selectedProduct);
    } catch (err) {
      console.log("Unable to fetch products: ", err);
    }
  };

  const { productId } = useParams();

  // Agar productId wrong ho ya product na mile
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-gray-500 mt-4 animate-pulse">Loading product details...</p>
      </div>
    );
  }

  const handleAddToCart = async (product) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const cartData = {
        userId: user._id,
        productId: product._id,
        quantity: 1,
      };

      const response = await sentToCart(cartData);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.log("Unable to add product to cart", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Link
        to="/products"
        className="group inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-[#088178] hover:text-white hover:border-[#088178] transition-all duration-300 shadow-sm font-semibold text-sm mb-6"
      >
        <span className="text-lg group-hover:-translate-x-1 transition-transform duration-300">
          &larr;
        </span>
        Back
      </Link>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="bg-gray-100 rounded-2xl p-4 flex justify-center">
          <img
            src={product.imgUrl}
            className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-center flex-wrap">
            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
              {product.categoryId?.name}
            </span>

            <span className="bg-[#15877F]/10 px-3 py-1 rounded-full text-sm text-[#15877F] font-medium">
              {product.variantId?.name}
            </span>

            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              (product.quantity ?? 10) <= 0 || product.sold
                ? "bg-red-50 text-red-600"
                : (product.quantity ?? 10) <= 3
                  ? "bg-amber-50 text-amber-600 animate-pulse"
                  : "bg-green-50 text-green-600"
            }`}>
              {(product.quantity ?? 10) <= 0 || product.sold 
                ? "Sold Out" 
                : `${product.quantity ?? 10} Items Left`}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {product.heading}
          </h1>
          <p className="text-2xl font-bold text-indigo-600">₹{product.price}</p>

          <div className="border-t pt-6 mt-4">
            <h3 className="text-lg font-semibold mb-2">Product Description</h3>
            <p className="text-gray-600 leading-relaxed text-justify">
              {product.description}
            </p>
          </div>

          <button
            className={`py-3 px-6 rounded-lg font-semibold transition duration-300 mt-4 ${
              (product.quantity ?? 10) <= 0 || product.sold
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#088178] hover:bg-[#06635c] text-white cursor-pointer shadow-md shadow-[#088178]/10"
            }`}
            onClick={() => handleAddToCart(product)}
            disabled={(product.quantity ?? 10) <= 0 || product.sold}
          >
            {(product.quantity ?? 10) <= 0 || product.sold ? "Sold Out" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
