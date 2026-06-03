import React from "react";
import budsImg from "../assets/HeroImage.png";

getbannerimages={
  
}
const Hero = () => {
  return (
    <div className="flex justify-between h-[90%] bg-[#E3E6F3]">
      <div className="w-[40%] p-16 flex flex-col justify-center">
        <span className="text-base font-bold uppercase tracking-wider text-gray-900">
          Trade-in-offer
        </span>

        <h2 className="text-5xl font-extrabold text-gray-900 leading-tight">
          Super value deals <br />
          <span className="text-[#15877F]">On all products</span>
        </h2>

        <p className="mt-2 text-base font-medium text-gray-600">
          Save more with coupons & up to 70% off!
        </p>

        <button className="mt-6 bg-[#15877F] text-white text-base font-semibold  py-4 px-4 rounded hover:bg-[#116d66] w-max">
          Shop Now
        </button>
      </div>
      <div className="w-[50%] flex justify-center items-center overflow-hidden ">
        <img
          src={budsImg}
          alt="banner image"
          className="h-full object-contain -scale-x-100"
        />
      </div>
    </div>
  );
};

export default Hero;
