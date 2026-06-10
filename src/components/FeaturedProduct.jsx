import React, { useEffect } from "react";
import EachProduct from "./EachProduct";
import { Link } from "react-router-dom";

const FeaturedProduct = (props) => {
  const productList = [
    {
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      alt: "Boat Premium Wireless Headphone",
      brand: "Boat",
      name: "Premium Wireless Headphone",
      price: 450,
    },
    {
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
      alt: "Noise Sleek Smart Watch v2",
      brand: "Noise",
      name: "Sleek Smart Watch v2",
      price: 1299,
    },
    {
      image:
        "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&q=80",
      alt: "Logitech Ergonomic Wireless Mouse",
      brand: "Logitech",
      name: "Ergonomic Wireless Mouse",
      price: 899,
    },
    {
      image:
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80",
      alt: "JBL Bass-Boost Bluetooth Speaker",
      brand: "JBL",
      name: "Bass-Boost Bluetooth Speaker",
      price: 2499,
    },
    {
      image:
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80",
      alt: "Sony Over-Ear Noise Cancelling Headphones",
      brand: "Sony",
      name: "Over-Ear Noise Cancelling Headphones",
      price: 7999,
    },
    {
      image:
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&q=80",
      alt: "Redgear RGB Mechanical Gaming Keyboard",
      brand: "Redgear",
      name: "RGB Mechanical Gaming Keyboard",
      price: 1850,
    },
    {
      image:
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80",
      alt: "HP Ultra-Slim 1080p Monitor",
      brand: "HP",
      name: "Ultra-Slim 1080p Monitor",
      price: 8500,
    },
    {
      image:
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80",
      alt: "Portronics 20000mAh Fast Charging Power Bank",
      brand: "Portronics",
      name: "20000mAh Fast Charging Power Bank",
      price: 1199,
    },
  ];
  return (
    <div className="w-full bg-white py-10">
      {!props.k && (
        <div className="px-10 mb-6">
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
        <h2 className="font-bold text-5xl text-[#222]">Featured Products</h2>
        <p className="text-[#465B52] text-base">
          Next-Gen Technology, Sleek Modern Design
        </p>
      </div>

      <div className="flex flex-wrap  gap-8 px-10">
        {productList.slice(0, props?.k).map((elem, idx) => {
          return (
            <div key={idx}>
              <EachProduct
                numEle={idx}
                k={props.k}
                img={elem.image}
                brand={elem.brand}
                name={elem.name}
                price={elem.price}
                alt={elem.alt}
                data={elem}
              />
            </div>
          );
        })}
      </div>
      {props.k && props.k < productList.length && (
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
