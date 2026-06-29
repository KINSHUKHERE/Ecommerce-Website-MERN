import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Menu, X, LogOut, ChevronDown } from "lucide-react";
import logo from "../assets/logo.png";
import { getDataCart } from "../api/CartApi";
import { getWishlist } from "../api/WishlistApi";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchWishlistCount = async (userObj) => {
    try {
      if (!userObj) {
        setWishlistCount(0);
        localStorage.removeItem("yocart_wishlist_ids");
        return;
      }
      const cached = localStorage.getItem("yocart_wishlist_ids");
      if (cached) {
        setWishlistCount(JSON.parse(cached).length);
        return;
      }
      const response = await getWishlist();
      const items = response.data.wishlistData || [];
      const ids = items.map((item) => item.productId?._id || item.productId).filter(Boolean);
      localStorage.setItem("yocart_wishlist_ids", JSON.stringify(ids));
      setWishlistCount(ids.length);
    } catch (err) {
      console.log("Unable to fetch wishlist count", err);
    }
  };

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
    fetchWishlistCount(userObj);

    const updateCart = () => {
      const freshUser = JSON.parse(localStorage.getItem("user"));
      fetchCartCount(freshUser);
    };

    const updateWishlist = () => {
      const freshUser = JSON.parse(localStorage.getItem("user"));
      if (!freshUser) {
        setWishlistCount(0);
        return;
      }
      const cached = localStorage.getItem("yocart_wishlist_ids");
      if (cached) {
        setWishlistCount(JSON.parse(cached).length);
      } else {
        fetchWishlistCount(freshUser);
      }
    };

    window.addEventListener("cartUpdated", updateCart);
    window.addEventListener("wishlistUpdated", updateWishlist);

    return () => {
      window.removeEventListener("cartUpdated", updateCart);
      window.removeEventListener("wishlistUpdated", updateWishlist);
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;

      if (Math.abs(prevScrollPos - currentScrollPos) < 12) {
        return;
      }

      if (currentScrollPos < 65) {
        setVisible(true);
      } else if (currentScrollPos > prevScrollPos) {
        if (!isOpen) {
          setVisible(false);
        }
      } else {
        setVisible(true);
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, isOpen]);

  const isAuthPage =
    location.pathname === "/register" || location.pathname === "/login";
  const isActive = (path) => location.pathname === path;

  const navLink = (path) =>
    `relative transition-colors duration-300 hover:text-primary py-1.5 text-sm font-medium ${
      isActive(path)
        ? "text-primary font-semibold after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-primary"
        : "text-muted-gray"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("yocart_wishlist_ids");
    setCurrentUser(null);
    setCartCount(0);
    setWishlistCount(0);
    setIsOpen(false);
    navigate("/login");
  };

  if (isAuthPage) return null;

  return (
    <nav className={`sticky top-0 z-50 w-full bg-white/75 backdrop-blur-md border-b border-light-border/40 shadow-xs transition-transform duration-300 ${
      visible ? "translate-y-0" : "-translate-y-full"
    }`}>
      <div className="flex h-16 items-center justify-between px-4 sm:px-8 lg:px-12 w-full">
        <Link className="flex items-center gap-1 h-full" to="/">
          <img src={logo} alt="YoCart" className="h-9 sm:h-10 w-auto object-contain" />
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
                className="px-4 py-2 border border-primary/20 text-primary rounded-xl hover:bg-primary/5 transition font-semibold text-sm cursor-pointer"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl shadow-xs hover:shadow-sm hover:opacity-95 transition font-semibold text-sm cursor-pointer"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/wishlist"
                className="relative transition-[color,transform] duration-300 hover:text-primary p-2 hover:scale-105 outline-none focus:outline-none"
              >
                <Heart size={22} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] min-w-[15px] h-[15px] rounded-full flex items-center justify-center font-black border border-white shadow-xs px-0.5">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative transition-[color,transform] duration-300 hover:text-primary p-2 hover:scale-105 outline-none focus:outline-none"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] min-w-[15px] h-[15px] rounded-full flex items-center justify-center font-black border border-white shadow-xs px-0.5">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Profile Avatar details */}
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:opacity-85 transition-opacity duration-300 cursor-pointer outline-none focus:outline-none"
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover shadow-inner" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex justify-center items-center font-bold text-xs uppercase shadow-inner">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
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
            <>
              <Link
                to="/wishlist"
                className="relative p-2 transition-colors duration-300 hover:text-[#15877F] outline-none focus:outline-none"
              >
                <Heart size={22} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] min-w-[15px] h-[15px] rounded-full flex items-center justify-center font-black border border-white shadow-xs px-0.5">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                to="/cart"
                className="relative p-2 transition-colors duration-300 hover:text-[#15877F] outline-none focus:outline-none"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] min-w-[15px] h-[15px] rounded-full flex items-center justify-center font-black border border-white shadow-xs px-0.5">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-[#15877F] cursor-pointer outline-none focus:outline-none"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 z-50 overflow-hidden transition-all duration-300 border-b border-light-border/40 bg-white/95 backdrop-blur-md shadow-lg ${
          isOpen ? "max-h-125 border-t border-light-border/40" : "max-h-0"
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
              to="/wishlist"
              className={`block py-1 hover:text-[#15877F] ${isActive("/wishlist") ? "text-[#15877F]" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              Wishlist
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
                className="w-full text-center py-2.5 border border-primary/20 text-primary rounded-xl font-semibold hover:bg-slate-50 transition"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:opacity-95 transition"
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
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex justify-center items-center font-bold text-xs uppercase">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <span className="font-semibold text-dark-navy text-sm">
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
