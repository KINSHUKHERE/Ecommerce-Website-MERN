import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, LogOut } from "lucide-react";
import logo from "../assets/logo.png";
import { getDataCart } from "../api/CartApi";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  const fetchCartCount = async () => {
    try {
      if (!user) return;

      const response = await getDataCart(user._id);

      const totalItems = response.data.cartData.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      setCartCount(totalItems);
    } catch (err) {
      console.log("Unable to fetch cart count", err);
    }
  };

  const updateCart = () => {
    fetchCartCount();
  };
  useEffect(() => {
    fetchCartCount();

    const updateCart = () => {
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", updateCart);

    return () => {
      window.removeEventListener("cartUpdated", updateCart);
    };
  }, [location.pathname]);

  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  const isAuthPage =
    location.pathname === "/register" || location.pathname === "/login";

  const isActive = (path) => location.pathname === path;

  const navLink = (path) =>
    `relative transition-all duration-300 hover:text-[#15877F] ${
      isActive(path)
        ? "text-[#15877F] font-semibold after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-[#15877F]"
        : "text-gray-700"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-md">
      <div className="mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          className="flex items-center gap-3"
          to={isAdmin ? "/admin" : "/"}
        >
          <img src={logo} alt="Shopora" className="h-12 w-12 object-contain" />

          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold text-[#15877F]">Shopora</span>

            <span className="text-xs tracking-wider text-gray-500">
              SHOP SMART
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        {!isAdmin ? (
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
        ) : (
          <ul className="hidden md:flex items-center gap-8 font-medium">
            <li>
              <Link className={navLink("/admin")} to="/admin">
                Dashboard
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
              <Link
                className={navLink("/contact-details")}
                to="/contact-details"
              >
                Contact Details
              </Link>
            </li>

            <li>
              <Link className={navLink("/order-details")} to="/order-details">
                Order Details
              </Link>
            </li>
          </ul>
        )}

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 border border-[#15877F] text-[#15877F] rounded-lg hover:bg-[#15877F] hover:text-white transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 bg-[#15877F] text-white rounded-lg hover:bg-[#126b64] transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {!isAdmin && (
                <Link
                  to="/cart"
                  className="relative transition-all duration-300 hover:text-[#15877F]"
                >
                  <ShoppingCart size={22} />

                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-3 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              <span className="font-medium text-gray-700">{user.name}</span>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden">
          {!isAdmin && user && (
            <Link
              to="/cart"
              className="relative transition-all duration-300 hover:text-[#15877F]"
            >
              <ShoppingCart size={24} />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 border-t" : "max-h-0"
        }`}
      >
        <ul className="bg-white px-6 py-5 flex flex-col gap-5 font-medium">
          {!isAdmin ? (
            <>
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
            </>
          ) : (
            <>
              <li>
                <Link to="/admin">Dashboard</Link>
              </li>

              <li>
                <Link to="/products">Products</Link>
              </li>

              <li>
                <Link to="/create-product">Create Product</Link>
              </li>

              <li>
                <Link to="/contact-details">Contact Details</Link>
              </li>

              <li>
                <Link to="/order-details">Order Details</Link>
              </li>
            </>
          )}

          {!user ? (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>

              <li>
                <Link to="/register">Sign Up</Link>
              </li>
            </>
          ) : (
            <li>
              <button
                onClick={handleLogout}
                className="text-red-500 font-medium"
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
