import { useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Cart from "../pages/Cart";
import LogIn from "../pages/Login";
import SignUp from "../pages/SignUp";
import AdminDashboard from "../pages/admin/AdminDashboard";
import CreateProduct from "../pages/admin/CreateProduct";
import ContactDetails from "../pages/admin/ContactDetails";
import OrderDetails from "../pages/admin/OrderDetails";
import CategoryManagement from "../pages/admin/CategoryManagement";
import BrandManagement from "../pages/admin/BrandManagement";
import Profile from "../pages/Profile";
import Wishlist from "../pages/Wishlist";
import Checkout from "../pages/Checkout";
import TermsConditions from "../pages/TermsConditions";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import CompleteProfile from "../pages/CompleteProfile";
import { getUserProfile } from "../api/AuthApi";

// Import Admin Layout & New Pages
import AdminLayout from "../admin/components/AdminLayout";
import AdminProducts from "../admin/pages/AdminProducts";
import ProductView from "../admin/pages/ProductView";
import ProductEdit from "../admin/pages/ProductEdit";

import Navbar from "../components/Navbar";

// Customer Layout Wrapper
const UserLayout = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-grow flex flex-col w-full">
        <Outlet />
      </main>
    </div>
  );
};

// Route Guard for authenticated users
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Route Guard for admin users only
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Route Guard for guests (redirect logged-in users away from login/signup)
const GuestRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    return user.role === "admin" ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const localUserStr = localStorage.getItem("user");
      if (!localUserStr) return;

      const isDeferred = sessionStorage.getItem("profileSetupDeferred") === "true";

      try {
        const localUser = JSON.parse(localUserStr);
        if (localUser && localUser.role !== "admin" && localUser.isProfileComplete === false && !isDeferred && location.pathname !== "/complete-profile") {
          navigate("/complete-profile", { replace: true });
          return;
        }
      } catch (e) {
        // Ignore json parse error
      }

      try {
        const res = await getUserProfile();
        const updatedUser = res.data;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        if (updatedUser && updatedUser.role !== "admin" && updatedUser.isProfileComplete === false && !isDeferred && location.pathname !== "/complete-profile") {
          navigate("/complete-profile", { replace: true });
        }
      } catch (err) {
        localStorage.removeItem("user");
        const protectedPaths = ["/cart", "/profile", "/checkout", "/admin", "/create-product", "/contact-details", "/order-details", "/categories", "/brands", "/complete-profile"];
        const isProtected = protectedPaths.some(path => location.pathname.startsWith(path));
        if (isProtected) {
          navigate("/login", { replace: true });
        }
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  useEffect(() => {
    let title = "YoCart";
    let desc = "YoCart - Premium Audio, Flagship Mobiles, Bluetooth Speakers & Gaming Gear.";
    const path = location.pathname;

    if (path === "/") {
      title = "YoCart | Premium E-Commerce Store";
      desc = "Discover flagship smartphones, premium audio headphones, mechanical keyboards, and bluetooth speakers with exclusive discounts.";
    } else if (path === "/products") {
      title = "Shop Products | YoCart Catalog";
      desc = "Browse our full range of high-quality electronics, smartphones, audio devices, and computer peripherals.";
    } else if (path.startsWith("/products/")) {
      title = "Product Details | YoCart";
    } else if (path === "/cart") {
      title = "Shopping Cart | YoCart";
      desc = "View your shopping cart items, select quantities, and proceed to checkout.";
    } else if (path === "/wishlist") {
      title = "My Wishlist | YoCart";
      desc = "Your saved products. Move items to your shopping cart or manage your favorites.";
    } else if (path === "/about") {
      title = "About Us | YoCart";
      desc = "Learn more about YoCart, our mission, values, and quality assurance principles.";
    } else if (path === "/contact") {
      title = "Contact Us | YoCart Customer Support";
      desc = "Reach out to our customer support team. Send your inquiries or support tickets.";
    } else if (path === "/profile" || path === "/admin/profile") {
      title = "My Profile | YoCart";
    } else if (path === "/checkout") {
      title = "Secure Checkout | YoCart";
    } else if (path === "/complete-profile") {
      title = "Complete Your Profile | YoCart";
    } else if (path === "/login") {
      title = "Log In | YoCart Account";
    } else if (path === "/register") {
      title = "Create Account | YoCart";
    } else if (path.startsWith("/admin")) {
      title = "Admin Dashboard | YoCart Panel";
    } else if (path === "/create-product") {
      title = "Create Product | YoCart Admin";
    } else if (path === "/contact-details") {
      title = "Contact Queries | YoCart Admin";
    } else if (path === "/order-details") {
      title = "Orders Directory | YoCart Admin";
    } else if (path === "/categories") {
      title = "Categories Management | YoCart Admin";
    } else if (path === "/brands") {
      title = "Brands Management | YoCart Admin";
    } else if (path === "/privacy-policy") {
      title = "Privacy Policy | YoCart";
    } else if (path === "/terms-conditions") {
      title = "Terms & Conditions | YoCart";
    }

    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", desc);
  }, [location.pathname]);

  return (
    <Routes>
      {/* Customer / Public / Guest Routes wrapped in UserLayout */}
      <Route element={<UserLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:productId" element={<ProductDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Guest-only Routes */}
        <Route path="/login" element={<GuestRoute><LogIn /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><SignUp /></GuestRoute>} />

        {/* Protected User Routes */}
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      </Route>

      {/* Complete Profile (no navbar) */}
      <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />

      {/* Protected Admin-only Routes wrapped in AdminLayout */}
      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/:productId" element={<ProductView />} />
        <Route path="/admin/products/edit/:productId" element={<ProductEdit />} />
        <Route path="/create-product" element={<AdminRoute><CreateProduct /></AdminRoute>} />
        <Route path="/contact-details" element={<AdminRoute><ContactDetails /></AdminRoute>} />
        <Route path="/order-details" element={<AdminRoute><OrderDetails /></AdminRoute>} />
        <Route path="/categories" element={<AdminRoute><CategoryManagement /></AdminRoute>} />
        <Route path="/brands" element={<AdminRoute><BrandManagement /></AdminRoute>} />
        <Route path="/admin/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

