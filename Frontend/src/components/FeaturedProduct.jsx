import React, { useEffect, useState } from "react";
import EachProduct from "./EachProduct";
import { Link } from "react-router-dom";
import { getProduct } from "../api/ProductApi";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

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
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-muted-gray text-sm font-medium animate-pulse">Loading products...</p>
      </div>
    );
  }

  const displayProducts = props.k
    ? products.slice(0, props.k)
    : products;

  return (
    <div className="w-full bg-white py-16 sm:py-20 border-b border-light-border/40">
      {!props.k && (
        <div className="px-6 sm:px-12 lg:px-16 mb-6">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 px-5 py-2 bg-white border border-light-border text-dark-navy rounded-xl hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all duration-300 shadow-2xs font-semibold text-xs cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>
        </div>
      )}

      <div className="text-center mb-10 flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-navy tracking-tight relative pb-3.5 w-fit">
          Featured Products
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"></span>
        </h2>

        <p className="text-xs sm:text-sm text-muted-gray font-medium mt-3.5">
          Next-Gen Technology, Sleek Modern Design
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-6 sm:px-12 lg:px-16 w-full">
        {displayProducts.map((elem) => (
          <EachProduct
            key={elem._id}
            data={elem}
            onRefresh={fetchProduct}
          />
        ))}
      </div>

      {props.k && props.k < products.length && (
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 cursor-pointer"
          >
            View All Products
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default FeaturedProduct;