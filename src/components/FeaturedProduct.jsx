import React from "react";
import EachProduct from "./EachProduct";

const FeaturedProduct = () => {
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
      <div className="text-center mb-10 flex flex-col gap-2">
        <h2 className="font-bold text-5xl text-[#222]">Featured Products</h2>
        <p className="text-[#465B52] text-base">
          Next-Gen Technology, Sleek Modern Design
        </p>
      </div>

      <div className="flex flex-wrap  gap-8 px-10">
        {/* Single Product Card */}
        {productList.map((elem) => {
          return (
            <div>
              <EachProduct
                img={elem.image}
                brand={elem.brand}
                name={elem.name}
                price={elem.price}
                alt={elem.alt}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedProduct;
