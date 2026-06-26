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
  if (pathname === "/admin") return "YoCart | Admin Dashboard";
  if (pathname === "/admin/products") return "YoCart | Admin - Products";
  if (pathname === "/create-product") return "YoCart | Admin - Create Product";
  if (pathname === "/contact-details") return "YoCart | Admin - Contact Queries";
  if (pathname === "/order-details") return "YoCart | Admin - Order Details";
  if (pathname === "/categories") return "YoCart | Admin - Categories";
  if (pathname === "/brands") return "YoCart | Admin - Brands";
  if (pathname === "/admin/profile") return "YoCart | Admin - Profile";

  // Dynamic routes fallback title
  if (pathname.startsWith("/admin/products/edit/")) {
    return "YoCart | Admin - Edit Product";
  }
  if (pathname.startsWith("/admin/products/")) {
    return "YoCart | Admin - View Product";
  }
  if (pathname.startsWith("/products/")) {
    return "YoCart | Product Details";
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
