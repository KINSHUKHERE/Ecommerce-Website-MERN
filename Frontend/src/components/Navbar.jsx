import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X } from "lucide-react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLink = (path) =>
    `relative transition-all duration-300 hover:text-[#15877F] ${
      isActive(path)
        ? "text-[#15877F] font-semibold after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-[#15877F]"
        : "text-gray-700"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-md">
      <div className="mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Shopora" className="h-12 w-12 object-contain" />

          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold text-[#15877F]">Shopora</span>
            <span className="text-xs tracking-wider text-gray-500">
              SHOP SMART
            </span>
          </div>
        </Link>

        <ul className="hidden md:flex items-center gap-8 font-medium">
          <li>
            <Link className={navLink("/")} to="/">
              Home
            </Link>
          </li>

          <li>
            <Link className={navLink("/products")} to="/products">
              Products
            </Link>
          </li>

          <li>
            <Link className={navLink("/create-product")} to="/create-product">
              Create Product
            </Link>
          </li>

          <li>
            <Link className={navLink("/about")} to="/about">
              About
            </Link>
          </li>

          <li>
            <Link className={navLink("/contact")} to="/contact">
              Contact
            </Link>
          </li>
        </ul>

        <div className="hidden md:flex items-center gap-5">
          <Link
            to="/cart"
            className="transition-all duration-300 hover:text-[#15877F] hover:scale-110 "
          >
            <ShoppingCart size={22} />
          </Link>
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <Link to="/cart">
            <ShoppingCart size={24} />
          </Link>

          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 border-t" : "max-h-0"
        }`}
      >
        <ul className="bg-white px-6 py-5 flex flex-col gap-5 font-medium">
          <li>
            <Link
              to="/"
              className={navLink("/")}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>

          <li>
            <Link
              to="/products"
              className={navLink("/products")}
              onClick={() => setIsOpen(false)}
            >
              Products
            </Link>
          </li>

          <li>
            <Link
              to="/create-product"
              className={navLink("/create-product")}
              onClick={() => setIsOpen(false)}
            >
              Create Product
            </Link>
          </li>

          <li>
            <Link
              to="/about"
              className={navLink("/about")}
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
          </li>

          <li>
            <Link
              to="/contact"
              className={navLink("/contact")}
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
          </li>

          <div className="flex items-center gap-6 border-t pt-4">
            <Link
              to="/cart"
              className="flex items-center gap-2 hover:text-[#15877F]"
            >
              <ShoppingCart size={20} />
              Cart
            </Link>
          </div>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
