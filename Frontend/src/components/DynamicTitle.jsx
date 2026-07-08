import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const getTitleFromPathname = (pathname) => {
  if (pathname === "/") return "YoCart | Shop Smart";
  if (pathname === "/products") return "YoCart | Products";
  if (pathname === "/about") return "YoCart | About Us";
  if (pathname === "/contact") return "YoCart | Contact Us";
  if (pathname === "/terms-conditions") return "YoCart | Terms & Conditions";
  if (pathname === "/privacy-policy") return "YoCart | Privacy Policy";
  if (pathname === "/login") return "YoCart | Sign In";
  if (pathname === "/register") return "YoCart | Sign Up";
  if (pathname === "/cart") return "YoCart | Cart";
  if (pathname === "/profile") return "YoCart | Profile";
  if (pathname === "/checkout") return "YoCart | Checkout";
  if (pathname === "/wishlist") return "YoCart | Wishlist";
  if (pathname === "/become-seller") return "YoCart | Become a Seller";
  if (pathname === "/complete-profile") return "YoCart | Complete Profile";
  if (pathname === "/admin") return "YoCart | Admin Dashboard";
  if (pathname === "/vendor") return "YoCart | Seller Dashboard";
  if (pathname === "/admin/products") return "YoCart | Admin - Products";
  if (pathname === "/vendor/products") return "YoCart | Seller - Products";
  if (pathname === "/create-product") return "YoCart | Admin - Create Product";
  if (pathname === "/vendor/create-product") return "YoCart | Seller - Create Product";
  if (pathname === "/contact-details") return "YoCart | Admin - Contact Queries";
  if (pathname === "/order-details") return "YoCart | Admin - Order Details";
  if (pathname === "/vendor/order-details") return "YoCart | Seller - Order Details";
  if (pathname === "/categories") return "YoCart | Admin - Categories";
  if (pathname === "/brands") return "YoCart | Admin - Brands";
  if (pathname === "/admin/profile") return "YoCart | Admin - Profile";
  if (pathname === "/vendor/profile") return "YoCart | Seller - Profile";
  if (pathname === "/admin/vendors") return "YoCart | Admin - Vendor Management";
  if (pathname === "/admin/users") return "YoCart | Admin - User Management";
  if (pathname === "/admin/support") return "YoCart | Admin - Support Query";
  if (pathname === "/vendor/support") return "YoCart | Seller - Support Query";
  if (pathname === "/admin/sale") return "YoCart | Admin - Festive Sale";
  if (pathname === "/vendor/sale") return "YoCart | Seller - Festive Sale";

  // Dynamic routes fallback title
  if (pathname.startsWith("/admin/vendors/")) {
    return "YoCart | Admin - Vendor Details";
  }
  if (pathname.startsWith("/admin/users/")) {
    return "YoCart | Admin - User Details";
  }
  if (pathname.startsWith("/admin/products/edit/")) {
    return "YoCart | Admin - Edit Product";
  }
  if (pathname.startsWith("/vendor/products/edit/")) {
    return "YoCart | Seller - Edit Product";
  }
  if (pathname.startsWith("/admin/products/")) {
    return "YoCart | Admin - View Product";
  }
  if (pathname.startsWith("/vendor/products/")) {
    return "YoCart | Seller - View Product";
  }
  if (pathname.startsWith("/products/")) {
    return "YoCart | Product Details";
  }
  if (pathname.startsWith("/store/")) {
    return "YoCart | Seller Storefront";
  }

  return "YoCart";
};

const DynamicTitle = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = getTitleFromPathname(pathname);
  }, [pathname]);

  return null;
};

export default DynamicTitle;
