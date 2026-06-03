import React from "react";
import EachProduct from "./EachProduct";

const FeaturedProduct = () => {
  return (
    <div className="w-full bg-white py-10">
      <div className="text-center mb-10 flex flex-col gap-2">
        <h2 className="font-bold text-5xl text-[#222]">Featured Products</h2>
        <p className="text-[#465B52] text-base">Next-Gen Technology, Sleek Modern Design</p>
      </div>

      <div className="flex flex-wrap  gap-8 px-10">
        
        {/* Single Product Card */}
        
        <EachProduct/>
        <EachProduct/>
        <EachProduct/>
        <EachProduct/>
        <EachProduct/>
        <EachProduct/>
        <EachProduct/>
       
      </div>
    </div>
  );
};

export default FeaturedProduct;