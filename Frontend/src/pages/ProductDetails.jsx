import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/ProductApi";
import { sentToCart } from "../api/CartApi";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState("");
  const [activeImgIndex, setActiveImgIndex] = useState(0);
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

  useEffect(() => {
    if (product) {
      document.title = `VELTIQ | ${product.Title || "Product Details"}`;
    }
  }, [product]);

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
        navigate("/login");
        return;
      }

      setAdding(true);
      const cartData = {
        userId: user._id,
        productId: product._id,
        quantity: 1,
      };

      const response = await sentToCart(cartData);
      window.dispatchEvent(new Event("cartUpdated"));
      
      setToast(`"${product.heading}" added to cart!`);
      setTimeout(() => {
        setToast("");
      }, 2500);
    } catch (err) {
      const errMsg = err.response?.data?.msg || "Unable to add product to cart";
      setToast(errMsg);
      setTimeout(() => {
        setToast("");
      }, 3000);
      console.log("Unable to add product to cart", err);
    } finally {
      setAdding(false);
    }
  };

  const allImages = [product.imgUrl, ...(product.images || [])].filter(Boolean);

  const nextSlide = () => {
    setActiveImgIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveImgIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Interactive Image Slider */}
        <div className="flex flex-col gap-4 w-full">
          <div className="bg-gray-100 rounded-2xl p-4 flex justify-center items-center relative aspect-[4/3] max-h-96 w-full group overflow-hidden border border-gray-150 shadow-sm">
            <img
              src={allImages[activeImgIndex]}
              alt={product.heading}
              className="max-h-full max-w-full object-contain rounded-lg transition-all duration-300 transform scale-100 hover:scale-105"
            />
            
            {allImages.length > 1 && (
              <>
                {/* Left Arrow */}
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-[#088178] hover:text-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                {/* Right Arrow */}
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-[#088178] hover:text-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnails list */}
          {allImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-none">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onMouseEnter={() => setActiveImgIndex(idx)}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 bg-white border rounded-xl overflow-hidden p-1.5 transition-all duration-200 cursor-pointer ${
                    activeImgIndex === idx
                      ? "border-[#088178] ring-2 ring-[#088178]/25 shadow-sm"
                      : "border-gray-200 hover:border-[#088178]/50"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-center flex-wrap">
            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
              {product.categoryId?.name}
            </span>

            <span className="bg-[#15877F]/10 px-3 py-1 rounded-full text-sm text-[#15877F] font-medium">
              {product.brandId?.name}
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
            className={`py-3 px-6 rounded-lg font-semibold transition duration-300 mt-4 flex items-center justify-center gap-2 ${
              (product.quantity ?? 10) <= 0 || product.sold
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#088178] hover:bg-[#06635c] text-white cursor-pointer shadow-md shadow-[#088178]/10"
            }`}
            onClick={() => handleAddToCart(product)}
            disabled={(product.quantity ?? 10) <= 0 || product.sold || adding}
          >
            {adding ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              (product.quantity ?? 10) <= 0 || product.sold ? "Sold Out" : "Add to Cart"
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

export default ProductDetails;
