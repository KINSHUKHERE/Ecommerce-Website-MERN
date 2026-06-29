import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Save scroll position on scroll
    const handleScroll = () => {
      sessionStorage.setItem(`scroll_${pathname}`, window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    if (navType === "POP") {
      const savedScroll = sessionStorage.getItem(`scroll_${pathname}`);
      if (savedScroll) {
        const scrollPosition = parseInt(savedScroll, 10);
        // Wait a tiny bit for the React components to render the DOM
        const timer = setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 100);
        return () => clearTimeout(timer);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, navType]);

  return null;
};

export default ScrollToTop;
