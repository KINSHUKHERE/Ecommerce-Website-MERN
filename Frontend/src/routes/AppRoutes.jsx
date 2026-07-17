import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getUserProfile } from "../api/AuthApi";

// Lazy Loaded Pages
const Home = lazy(() => import("../pages/Home"));
const Products = lazy(() => import("../pages/Products"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));
const Cart = lazy(() => import("../pages/Cart"));
const LogIn = lazy(() => import("../pages/Login"));
const SignUp = lazy(() => import("../pages/SignUp"));
const VendorStore = lazy(() => import("../pages/VendorStore"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const CreateProduct = lazy(() => import("../pages/admin/CreateProduct"));
const ContactDetails = lazy(() => import("../pages/admin/ContactDetails"));
const OrderDetails = lazy(() => import("../pages/admin/OrderDetails"));
const CategoryManagement = lazy(() => import("../pages/admin/CategoryManagement"));
const BrandManagement = lazy(() => import("../pages/admin/BrandManagement"));
const VendorManagement = lazy(() => import("../pages/admin/VendorManagement"));
const UserManagement = lazy(() => import("../pages/admin/UserManagement"));
const VendorDetails = lazy(() => import("../pages/admin/VendorDetails"));
const UserDetails = lazy(() => import("../pages/admin/UserDetails"));
const VendorSupport = lazy(() => import("../pages/admin/VendorSupport"));
const SaleManagement = lazy(() => import("../pages/admin/SaleManagement"));
const ProductReviews = lazy(() => import("../pages/admin/ProductReviews"));
const Profile = lazy(() => import("../pages/Profile"));
const Addresses = lazy(() => import("../pages/Addresses"));
const MyOrders = lazy(() => import("../pages/MyOrders"));
const Wishlist = lazy(() => import("../pages/Wishlist"));
const Checkout = lazy(() => import("../pages/Checkout"));
const TermsConditions = lazy(() => import("../pages/TermsConditions"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const CompleteProfile = lazy(() => import("../pages/CompleteProfile"));
const BecomeSeller = lazy(() => import("../pages/BecomeSeller"));

// Import Admin Layout & New Pages
import AdminLayout from "../admin/components/AdminLayout";
const AdminProducts = lazy(() => import("../admin/pages/AdminProducts"));
const ProductView = lazy(() => import("../admin/pages/ProductView"));
const ProductEdit = lazy(() => import("../admin/pages/ProductEdit"));

import Navbar from "../components/Navbar";

// Customer Layout Wrapper
const UserLayout = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "vendor") return <Navigate to="/vendor" replace />;
  }
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-grow flex flex-col w-full">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20 w-full min-h-[300px]">
            <Loader2 className="animate-spin text-primary w-8 h-8 mb-2" />
            <span className="text-xs font-semibold text-muted-gray">Loading page...</span>
          </div>
        }>
          <Outlet />
        </Suspense>
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

// Route Guard for dashboard access (admin or vendor)
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "admin" && user.role !== "vendor") {
    return <Navigate to="/" replace />;
  }

  const path = window.location.pathname;
  if (user.role === "vendor") {
    if (path.startsWith("/admin")) {
      return <Navigate to={path.replace("/admin", "/vendor")} replace />;
    }
    if (path === "/create-product") {
      return <Navigate to="/vendor/create-product" replace />;
    }
    if (path === "/order-details") {
      return <Navigate to="/vendor/order-details" replace />;
    }
  }
  if (user.role === "admin") {
    if (path.startsWith("/vendor")) {
      return <Navigate to={path.replace("/vendor", "/admin")} replace />;
    }
  }

  return children;
};

// Route Guard for active features (Super Admin or active vendors)
const ActiveVendorOrAdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === "vendor" && user.vendorStatus !== "active") {
    return <Navigate to="/vendor" replace />;
  }
  return children;
};

// Route Guard for guests (redirect logged-in users away from login/signup)
const GuestRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "vendor") return <Navigate to="/vendor" replace />;
    return <Navigate to="/" replace />;
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
        const protectedPaths = ["/cart", "/profile", "/addresses", "/checkout", "/admin", "/create-product", "/contact-details", "/order-details", "/categories", "/brands", "/complete-profile"];
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
    } else if (path === "/orders") {
      title = "My Orders | YoCart";
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
    } else if (path.startsWith("/vendor")) {
      if (path === "/vendor") {
        title = "Seller Dashboard | YoCart Panel";
      } else if (path === "/vendor/products") {
        title = "Seller Products | YoCart Panel";
      } else if (path === "/vendor/create-product") {
        title = "Create Product | YoCart Seller";
      } else if (path === "/vendor/order-details") {
        title = "Orders Directory | YoCart Seller";
      } else if (path === "/vendor/profile") {
        title = "Seller Profile | YoCart Panel";
      } else if (path === "/vendor/support") {
        title = "Seller Support | YoCart Panel";
      } else if (path === "/vendor/sale") {
        title = "Festive Sale | YoCart Seller";
      } else if (path === "/vendor/reviews") {
        title = "Customer Reviews | YoCart Seller";
      } else {
        title = "Seller Dashboard | YoCart Panel";
      }
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
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-xs font-semibold text-muted-gray animate-pulse">
          Loading page content...
        </p>
      </div>
    }>
      <Routes>
        {/* Customer / Public / Guest Routes wrapped in UserLayout */}
        <Route element={<UserLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          <Route path="/store/:vendorId" element={<VendorStore />} />
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
          <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/become-seller" element={<ProtectedRoute><BecomeSeller /></ProtectedRoute>} />
        </Route>

        {/* Complete Profile (no navbar) */}
        <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />

        {/* Protected Admin-only Routes wrapped in AdminLayout */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/vendor" element={<AdminDashboard />} />

          <Route path="/admin/sale" element={<SaleManagement />} />
          <Route path="/vendor/sale" element={<SaleManagement />} />
          
          <Route path="/admin/products" element={<ActiveVendorOrAdminRoute><AdminProducts /></ActiveVendorOrAdminRoute>} />
          <Route path="/vendor/products" element={<ActiveVendorOrAdminRoute><AdminProducts /></ActiveVendorOrAdminRoute>} />
          
          <Route path="/admin/products/:productId" element={<ActiveVendorOrAdminRoute><ProductView /></ActiveVendorOrAdminRoute>} />
          <Route path="/vendor/products/:productId" element={<ActiveVendorOrAdminRoute><ProductView /></ActiveVendorOrAdminRoute>} />
          
          <Route path="/admin/products/edit/:productId" element={<ActiveVendorOrAdminRoute><ProductEdit /></ActiveVendorOrAdminRoute>} />
          <Route path="/vendor/products/edit/:productId" element={<ActiveVendorOrAdminRoute><ProductEdit /></ActiveVendorOrAdminRoute>} />
          
          <Route path="/create-product" element={<ActiveVendorOrAdminRoute><CreateProduct /></ActiveVendorOrAdminRoute>} />
          <Route path="/vendor/create-product" element={<ActiveVendorOrAdminRoute><CreateProduct /></ActiveVendorOrAdminRoute>} />
          
          <Route path="/order-details" element={<ActiveVendorOrAdminRoute><OrderDetails /></ActiveVendorOrAdminRoute>} />
          <Route path="/vendor/order-details" element={<ActiveVendorOrAdminRoute><OrderDetails /></ActiveVendorOrAdminRoute>} />
          
          <Route path="/admin/profile" element={<Profile />} />
          <Route path="/vendor/profile" element={<Profile />} />
          
          <Route path="/admin/reviews" element={<ActiveVendorOrAdminRoute><ProductReviews /></ActiveVendorOrAdminRoute>} />
          <Route path="/vendor/reviews" element={<ActiveVendorOrAdminRoute><ProductReviews /></ActiveVendorOrAdminRoute>} />
          
          <Route path="/admin/support" element={<AdminRoute><VendorSupport /></AdminRoute>} />
          <Route path="/vendor/support" element={<AdminRoute><VendorSupport /></AdminRoute>} />

          {/* Admin-only Routes */}
          <Route path="/contact-details" element={<AdminRoute><ContactDetails /></AdminRoute>} />
          <Route path="/categories" element={<AdminRoute><CategoryManagement /></AdminRoute>} />
          <Route path="/brands" element={<AdminRoute><BrandManagement /></AdminRoute>} />
          <Route path="/admin/vendors" element={<AdminRoute><VendorManagement /></AdminRoute>} />
          <Route path="/admin/vendors/:vendorId" element={<AdminRoute><VendorDetails /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="/admin/users/:userId" element={<AdminRoute><UserDetails /></AdminRoute>} />
        </Route>
      </Routes>
    </Suspense>
  );
};


export default AppRoutes;

