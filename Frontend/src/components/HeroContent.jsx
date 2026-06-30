import React from "react";
import { useNavigate } from "react-router-dom";

const HeroContent = (props) => {
  const navigate = useNavigate()
  return (
    <div 
      className="w-full h-full flex-shrink-0 bg-cover bg-center bg-no-repeat flex items-center relative select-none" 
      style={{ 
        backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.45) 50%, rgba(15, 23, 42, 0.1) 100%), url(${props.bgImage})` 
      }}
    >
      <div className="relative z-10 w-[90%] sm:w-[75%] md:w-[60%] lg:w-[50%] ml-6 sm:ml-12 md:ml-20 flex flex-col justify-center text-left text-white">
        <span className="text-[10px] sm:text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#2ee0d2] mb-1 sm:mb-2">
          {props.topHeading}
        </span>

        <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
          {props.midHeading} <br />
          <span className="text-[#088178] bg-white/95 border border-[#088178]/10 px-3 py-1 rounded-xl text-xs sm:text-sm md:text-base font-extrabold mt-2 sm:mt-3 inline-block shadow-sm">
            {props.offerText}
          </span>
        </h2>

        <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base font-medium text-slate-350 max-w-sm sm:max-w-md leading-relaxed">
          {props.description}
        </p>

        <button className="mt-6 sm:mt-7 bg-[#088178] hover:bg-[#06635c] text-white text-xs sm:text-sm font-extrabold py-3 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-98 cursor-pointer w-fit" onClick={() => navigate("/products")}>
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default HeroContent;