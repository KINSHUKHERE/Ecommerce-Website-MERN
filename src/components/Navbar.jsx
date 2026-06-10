import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, ShoppingCart, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const activeClass = "text-[#15877F] font-bold border-b-2 border-[#15877F]";
  const inactiveClass = "hover:text-[#15877F] transition-colors";

  return (
    <div className="w-full bg-[#E3E6F3] sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="flex justify-between w-full h-18 px-4 md:px-6 py-4 items-center">
        {/* Logo Section */}
        <div className="flex gap-2 px-3 items-center">
          {/* ... SVG Logo ... */}
          <h1 className="text-xl md:text-2xl font-semibold whitespace-nowrap">ELECTRONIC STORE</h1>
        </div>

        {/* Desktop Links & Icons */}
        <div className="hidden md:flex items-center gap-6 px-4 list-none font-medium">
          <li className={isActive("/") ? activeClass : inactiveClass}><Link to="/">Home</Link></li>
          <li className={isActive("/products") ? activeClass : inactiveClass}><Link to="/products">Products</Link></li>
          <li className={isActive("/about") ? activeClass : inactiveClass}><Link to="/about">About Us</Link></li>
          <li className={isActive("/contact") ? activeClass : inactiveClass}><Link to="/contact">Contact Us</Link></li>
          
          <div className="flex items-center gap-4 border-l pl-6 border-gray-400">
            <Link to="/wishlist" className="hover:text-[#15877F]"><Heart size={22} /></Link>
            <Link to="/cart" className="hover:text-[#15877F]"><ShoppingCart size={22} /></Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <Link to="/cart"><ShoppingCart size={22} /></Link>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#E3E6F3] border-t border-gray-300 px-6 py-4 transition-all">
          <ul className="flex flex-col gap-4 font-medium">
            <li className={isActive("/") ? "text-[#15877F]" : ""}><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
            <li className={isActive("/products") ? "text-[#15877F]" : ""}><Link to="/products" onClick={() => setIsOpen(false)}>Products</Link></li>
            <li className={isActive("/about") ? "text-[#15877F]" : ""}><Link to="/about" onClick={() => setIsOpen(false)}>About Us</Link></li>
            <li className={isActive("/contact") ? "text-[#15877F]" : ""}><Link to="/contact" onClick={() => setIsOpen(false)}>Contact Us</Link></li>
            <li className="flex gap-4 pt-4 border-t border-gray-300">
               <Link to="/wishlist" className="flex items-center gap-2"><Heart size={20} /> Wishlist</Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;