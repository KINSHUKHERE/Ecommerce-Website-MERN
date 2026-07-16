import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import paymentGatewaysImg from "../assets/pngegg.png";
import { Link, useLocation } from "react-router-dom";
import { 
  Send, 
  MapPin, 
  Phone
} from "lucide-react";
import { SmoothInput } from "./SmoothInput";

const Footer = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const location = useLocation();

  useEffect(() => {
    const userObj = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(userObj);
  }, [location.pathname]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus("Subscribed!");
    setNewsletterEmail("");
    setTimeout(() => setNewsletterStatus(""), 3000);
  };

  return (
    <footer className="bg-soft-bg text-muted-gray border-t border-light-border/70 font-sans antialiased">
      {/* Top Main Footer Grid */}
      <div className="w-full px-6 sm:px-12 lg:px-16 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
        
        {/* Brand & Social Column */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="inline-block w-fit hover:opacity-90 transition-opacity">
            <img
              src={logo}
              alt="YoCart"
              className="h-9 w-auto object-contain"
            />
          </Link>
          <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
            YoCart is your ultimate destination for flagship smartphones, premium audio, and elite gaming setups. Elevate your digital lifestyle.
          </p>
          {/* Social Badges */}
          <div className="flex items-center gap-3 mt-1">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-9 h-9 rounded-full bg-white hover:bg-primary text-muted-gray hover:text-white flex items-center justify-center transition-all duration-300 border border-light-border shadow-xs hover:border-primary hover:-translate-y-0.5"
              title="Instagram"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
              </svg>
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-9 h-9 rounded-full bg-white hover:bg-primary text-muted-gray hover:text-white flex items-center justify-center transition-all duration-300 border border-light-border shadow-xs hover:border-primary hover:-translate-y-0.5"
              title="Facebook"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
              </svg>
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-9 h-9 rounded-full bg-white hover:bg-primary text-muted-gray hover:text-white flex items-center justify-center transition-all duration-300 border border-light-border shadow-xs hover:border-primary hover:-translate-y-0.5"
              title="YouTube"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93 .502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-dark-navy font-bold text-xs uppercase tracking-wider mb-1 mt-2 sm:mt-0">
            Quick Shop
          </h3>
          <Link to="/products" className="text-xs sm:text-sm text-muted-gray hover:text-primary transition-colors w-fit">
            All Products
          </Link>
          <Link to="/products?category=676bc8ecb684cb3229b47e8e" className="text-xs sm:text-sm text-muted-gray hover:text-primary transition-colors w-fit">
            Audio Headphones
          </Link>
          <Link to="/products?category=676bc802b684cb3229b47e80" className="text-xs sm:text-sm text-muted-gray hover:text-primary transition-colors w-fit">
            Flagship Mobiles
          </Link>
          <Link to="/products?category=676bc8b3b684cb3229b47e8b" className="text-xs sm:text-sm text-muted-gray hover:text-primary transition-colors w-fit">
            Gaming Accessories
          </Link>
        </div>

        {/* Info & Support Column */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-dark-navy font-bold text-xs uppercase tracking-wider mb-1 mt-2 sm:mt-0">
            Support & Info
          </h3>
          <Link to="/about" className="text-xs sm:text-sm text-muted-gray hover:text-primary transition-colors w-fit">
            About Us
          </Link>
          <Link to="/privacy-policy" className="text-xs sm:text-sm text-muted-gray hover:text-primary transition-colors w-fit">
            Privacy Policy
          </Link>
          <Link to="/terms-conditions" className="text-xs sm:text-sm text-muted-gray hover:text-primary transition-colors w-fit">
            Terms & Conditions
          </Link>
          <Link to="/contact" className="text-xs sm:text-sm text-muted-gray hover:text-primary transition-colors w-fit">
            Contact Support
          </Link>
          <Link to="/become-seller" className="text-xs sm:text-sm text-primary hover:text-primary-hover font-bold transition-colors w-fit">
            Become a Seller
          </Link>
        </div>

        {/* Newsletter Column */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-dark-navy font-bold text-xs uppercase tracking-wider mb-1 mt-2 sm:mt-0">
            Newsletter
          </h3>
          <p className="text-xs text-muted-gray leading-relaxed">
            Subscribe to receive exclusive deals, early launches, and tech reviews.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex border border-light-border rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/5 transition-all mt-1.5 bg-white p-1 shadow-2xs">
            <SmoothInput
              type="email"
              id="newsletter-email"
              name="newsletter-email"
              autoComplete="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Your email address"
              className="bg-transparent border-0 px-3 py-2 text-xs text-dark-navy placeholder-muted-gray/50 focus:outline-none w-full min-w-0"
              required
            />
            <button 
              type="submit"
              className="bg-primary hover:bg-primary-hover px-3.5 rounded-lg flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <Send size={12} />
            </button>
          </form>
          {newsletterStatus && (
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 self-start animate-pulse">
              {newsletterStatus}
            </span>
          )}

          {/* Secure Payment Logo */}
          <div className="mt-3 pt-0.5">
            <span className="text-[10px] text-muted-gray/70 uppercase tracking-wider font-extrabold block mb-1.5">
              Secure Checkout
            </span>
            <img
              className="h-7 w-auto object-contain brightness-95 opacity-85"
              src={paymentGatewaysImg}
              alt="Payment Gateways"
            />
          </div>
        </div>

      </div>

      {/* Bottom Bar: Copyright & Location details */}
      <div className="border-t border-light-border/70 bg-slate-100/35 py-5 text-center text-xs text-muted-gray">
        <div className="w-full px-6 sm:px-12 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-muted-gray/80">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-primary/70" /> Poornima University, Jaipur
            </span>
            <span className="hidden sm:inline text-light-border">|</span>
            <span className="flex items-center gap-1">
              <Phone size={12} className="text-primary/70" /> +91 80588XXXXX
            </span>
          </div>
          <p className="font-medium text-muted-gray/70">
            © {new Date().getFullYear()} YoCart E-Commerce. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
