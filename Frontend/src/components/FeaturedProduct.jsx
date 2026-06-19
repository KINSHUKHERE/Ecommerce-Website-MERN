import React, { useEffect, useState } from "react";
import EachProduct from "./EachProduct";
import { Link } from "react-router-dom";
import { getProduct } from "../api/ProductApi";

const FeaturedProduct = (props) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await getProduct();
      setProducts(res.data.data);
    } catch (err) {
      console.log("Unable to get product");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white py-20 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#15877F]"></div>
        <p className="text-gray-500 mt-4 animate-pulse">Loading products...</p>
      </div>
    );
  }

  const displayProducts = props.k
    ? products.slice(0, props.k)
    : products;

  return (
    <div className="w-full bg-white py-10">
      {!props.k && (
        <div className="px-4 md:px-10 mb-6">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-[#088178] hover:text-white hover:border-[#088178] transition-all duration-300 shadow-sm font-semibold text-sm"
          >
            <span className="text-lg group-hover:-translate-x-1 transition-transform duration-300">
              &larr;
            </span>
            Back
          </Link>
        </div>
      )}

      <div className="text-center mb-10 flex flex-col gap-2">
        <h2 className="font-bold text-5xl text-[#222]">
          Featured Products
        </h2>

        <p className="text-[#465B52] text-base">
          Next-Gen Technology, Sleek Modern Design
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 px-4 md:px-10">
        {displayProducts.map((elem) => (
          <EachProduct
            key={elem._id}
            data={elem}
            onRefresh={fetchProduct}
          />
        ))}
      </div>

      {props.k && props.k < products.length && (
        <div className="text-center mt-10">
          <Link
            to="/products"
            className="px-6 py-3 bg-[#088178] text-white rounded-lg hover:bg-[#06635c] transition"
          >
            View All Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default FeaturedProduct;