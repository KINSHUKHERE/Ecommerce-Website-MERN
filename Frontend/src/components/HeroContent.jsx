import React from "react";

const HeroContent = (props) => {
  return (
    <div 
      className="w-full h-full flex-shrink-0 bg-cover bg-right bg-no-repeat flex items-center relative select-none" 
      style={{ backgroundImage: `url(${props.bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <div className="relative z-10 w-[85%] sm:w-[70%] md:w-[50%] lg:w-[45%] ml-4 sm:ml-6 md:ml-16 p-4 sm:p-6 md:p-8 flex flex-col justify-center rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10">
        <span className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-emerald-400">
          {props.topHeading}
        </span>

        <h2 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight mt-0.5 sm:mt-1 drop-shadow-md">
          {props.midHeading} <br />
          <span className="text-[#2ee0d2]"> {props.offerText}</span>
        </h2>

        <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm font-medium text-slate-200 max-w-sm drop-shadow-sm line-clamp-1 sm:line-clamp-none">
          {props.description}
        </p>

        <button className="mt-2.5 sm:mt-4 bg-[#15877F] text-white text-xs sm:text-sm md:text-base font-semibold py-1.5 sm:py-2.5 px-4 sm:px-6 rounded-full hover:bg-[#116d66] transition-all w-max shadow-md cursor-pointer">
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default HeroContent;