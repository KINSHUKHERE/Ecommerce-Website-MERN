import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const getTitleFromPathname = (pathname) => {
  if (pathname === "/") return "VELTIQ | Shop Smart";
  if (pathname === "/products") return "VELTIQ | Products";
  if (pathname === "/about") return "VELTIQ | About Us";
  if (pathname === "/contact") return "VELTIQ | Contact Us";
  if (pathname === "/terms-conditions") return "VELTIQ | Terms & Conditions";
  if (pathname === "/privacy-policy") return "VELTIQ | Privacy Policy";
  if (pathname === "/login") return "VELTIQ | Sign In";
  if (pathname === "/register") return "VELTIQ | Sign Up";
  if (pathname === "/cart") return "VELTIQ | Cart";
  if (pathname === "/profile") return "VELTIQ | Profile";
  if (pathname === "/checkout") return "VELTIQ | Checkout";
  if (pathname === "/admin") return "VELTIQ | Admin Dashboard";
  if (pathname === "/admin/products") return "VELTIQ | Admin - Products";
  if (pathname === "/create-product") return "VELTIQ | Admin - Create Product";
  if (pathname === "/contact-details") return "VELTIQ | Admin - Contact Queries";
  if (pathname === "/order-details") return "VELTIQ | Admin - Order Details";
  if (pathname === "/categories") return "VELTIQ | Admin - Categories";
  if (pathname === "/variants") return "VELTIQ | Admin - Variants";
  if (pathname === "/admin/profile") return "VELTIQ | Admin - Profile";

  // Dynamic routes fallback title
  if (pathname.startsWith("/admin/products/edit/")) {
    return "VELTIQ | Admin - Edit Product";
  }
  if (pathname.startsWith("/admin/products/")) {
    return "VELTIQ | Admin - View Product";
  }
  if (pathname.startsWith("/products/")) {
    return "VELTIQ | Product Details";
  }

  return "VELTIQ";
};

const DynamicTitle = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = getTitleFromPathname(pathname);
  }, [pathname]);

  return null;
};

export default DynamicTitle;
