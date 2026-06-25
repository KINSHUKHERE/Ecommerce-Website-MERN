import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, LogOut, ChevronDown } from "lucide-react";
import logo from "../assets/logo.png";
import { getDataCart } from "../api/CartApi";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchCartCount = async (userObj) => {
    try {
      if (!userObj) {
        setCartCount(0);
        return;
      }

      const response = await getDataCart();
      const totalItems = response.data.cartData.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      setCartCount(totalItems);
    } catch (err) {
      console.log("Unable to fetch cart count", err);
    }
  };

  useEffect(() => {
    const userObj = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(userObj);
    fetchCartCount(userObj);

    const updateCart = () => {
      const freshUser = JSON.parse(localStorage.getItem("user"));
      fetchCartCount(freshUser);
    };

    window.addEventListener("cartUpdated", updateCart);

    return () => {
      window.removeEventListener("cartUpdated", updateCart);
    };
  }, [location.pathname]);

  const isAuthPage =
    location.pathname === "/register" || location.pathname === "/login";
  const isActive = (path) => location.pathname === path;

  const navLink = (path) =>
    `relative transition-colors duration-300 hover:text-[#15877F] py-2 ${
      isActive(path)
        ? "text-[#15877F] font-semibold after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-[#15877F]"
        : "text-gray-700"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setCurrentUser(null);
    setCartCount(0);
    setIsOpen(false);
    navigate("/login");
  };

  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-10 max-w-7xl w-full">
        <Link className="flex items-center gap-2" to="/">
          <img src={logo} alt="Veltiq" className="h-12 w-12 sm:h-14 sm:w-14 object-contain" />
          <div className="flex flex-col leading-none">
            <span className="text-lg sm:text-xl font-bold text-[#15877F] tracking-tight">VELTIQ</span>
            <span className="text-[9px] sm:text-xs tracking-wider text-gray-500">
              POWERING SMART LIFE
            </span>
          </div>
        </Link>


        {/* Desktop Menu */}
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

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-5">
          {!currentUser ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 border border-[#15877F] text-[#15877F] rounded-lg hover:bg-[#15877F] hover:text-white transition font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-[#15877F] text-white rounded-lg hover:bg-[#126b64] transition font-medium"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/cart"
                className="relative transition-[color,transform] duration-300 hover:text-[#15877F] p-2 hover:scale-105 outline-none focus:outline-none"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-4.5 h-4.5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Profile Avatar details */}
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:opacity-85 transition-opacity duration-300 cursor-pointer outline-none focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-[#15877F] text-white flex justify-center items-center font-bold text-xs uppercase shadow-inner">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="font-medium text-gray-700 text-sm hidden lg:block max-w-30 truncate">
                  {currentUser.name}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-red-500 text-white px-3.5 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 text-sm font-medium cursor-pointer outline-none focus:outline-none"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Action Row */}
        <div className="flex items-center gap-4 md:hidden">
          {currentUser && (
            <Link
              to="/cart"
              className="relative p-2 transition-colors duration-300 hover:text-[#15877F] outline-none focus:outline-none"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-[#15877F] cursor-pointer outline-none focus:outline-none"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-125 border-t bg-gray-50" : "max-h-0"
        }`}
      >
        <ul className="px-6 py-5 flex flex-col gap-4 font-medium text-gray-700">
          <li>
            <Link
              to="/"
              className={`block py-1 hover:text-[#15877F] ${isActive("/") ? "text-[#15877F]" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/products"
              className={`block py-1 hover:text-[#15877F] ${isActive("/products") ? "text-[#15877F]" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={`block py-1 hover:text-[#15877F] ${isActive("/about") ? "text-[#15877F]" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={`block py-1 hover:text-[#15877F] ${isActive("/contact") ? "text-[#15877F]" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
          </li>

          <hr className="border-gray-200 my-2" />

          {!currentUser ? (
            <div className="flex flex-col gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 border border-[#15877F] text-[#15877F] rounded-lg font-semibold hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 bg-[#15877F] text-white rounded-lg font-semibold hover:bg-[#126b64]"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 hover:opacity-85 transition-opacity duration-300 cursor-pointer outline-none focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-[#15877F] text-white flex justify-center items-center font-bold text-xs uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="font-medium text-gray-700 text-sm">
                  {currentUser.name}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors duration-300 text-sm font-semibold outline-none focus:outline-none"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
