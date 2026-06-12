import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/ProductApi";

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const navigate = useNavigate()

  const cartBtnClicked = ()=>{
    navigate('/cart')
  }

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
    return <div className="p-10 text-center text-xl">Product not found!</div>;
  }

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
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {product.brandName}
          </h2>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {product.heading}
          </h1>
          <p className="text-2xl font-bold text-indigo-600">
            ₹{product.price}
          </p>

          <div className="border-t pt-6 mt-4">
            <h3 className="text-lg font-semibold mb-2">Product Description</h3>
            <p className="text-gray-600 leading-relaxed text-justify">
              {product.description}
            </p>
          </div>

          <button className="bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 mt-4 cursor-pointer"
          onClick={cartBtnClicked}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
