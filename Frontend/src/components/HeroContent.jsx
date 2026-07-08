import React from "react";
import { useNavigate } from "react-router-dom";
import { getThemeConfig } from "../theme/ThemeEngine";

const HeroContent = (props) => {
  const navigate = useNavigate();
  const theme = getThemeConfig(props.themeKey || "normal");

  const bgStyle = props.isFestive
    ? {}
    : {
        backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.45) 50%, rgba(15, 23, 42, 0.1) 100%), url(${props.bgImage})`
      };

  const containerClass = props.isFestive
    ? `w-full h-full flex-shrink-0 bg-gradient-to-r ${theme.heroGradient} flex items-center relative select-none overflow-hidden`
    : "w-full h-full flex-shrink-0 bg-cover bg-center bg-no-repeat flex items-center relative select-none";

  return (
    <div className={containerClass} style={bgStyle}>
      {/* Floating Festive Elements on the right */}
      {props.isFestive && theme.illustrations && (
        <div className="absolute right-10 sm:right-16 md:right-24 top-1/2 -translate-y-1/2 flex items-center gap-4 sm:gap-6 opacity-25 md:opacity-50 pointer-events-none select-none">
          {theme.illustrations.map((icon, idx) => (
            <span
              key={idx}
              className="text-5xl sm:text-6xl md:text-8xl animate-bounce"
              style={{ animationDelay: `${idx * 0.3}s`, animationDuration: "2.5s" }}
            >
              {icon}
            </span>
          ))}
        </div>
      )}

      <div className="relative z-10 w-[90%] sm:w-[75%] md:w-[60%] lg:w-[50%] ml-6 sm:ml-12 md:ml-20 flex flex-col justify-center text-left text-white">
        <span className={`text-[10px] sm:text-xs md:text-sm font-extrabold uppercase tracking-widest mb-1 sm:mb-2 ${props.isFestive ? "text-amber-300" : "text-[#2ee0d2]"}`}>
          {props.topHeading}
        </span>

        <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
          {props.midHeading} <br />
          <span className={`bg-white/95 px-3 py-1 rounded-xl text-xs sm:text-sm md:text-base font-extrabold mt-2 sm:mt-3 inline-block shadow-sm border ${props.isFestive ? "text-orange-600 border-orange-100" : "text-[#088178] border-[#088178]/10"}`}>
            {props.offerText}
          </span>
        </h2>

        <p className={`mt-3 sm:mt-4 text-xs sm:text-sm md:text-base font-medium max-w-sm sm:max-w-md leading-relaxed ${props.isFestive ? "text-orange-50/90" : "text-slate-350"}`}>
          {props.description}
        </p>

        <button 
          className={`mt-6 sm:mt-7 text-white text-xs sm:text-sm font-extrabold py-3 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-98 cursor-pointer w-fit ${props.isFestive ? "bg-orange-500 hover:bg-orange-600" : "bg-[#088178] hover:bg-[#06635c]"}`} 
          onClick={() => navigate("/products")}
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default HeroContent;