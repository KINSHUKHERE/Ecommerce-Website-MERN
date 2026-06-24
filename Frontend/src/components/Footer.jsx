import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import paymentGatewaysImg from "../assets/pngegg.png";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const userObj = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(userObj);
  }, [location.pathname]);

  return (
    <footer className="bg-[#f8f9fa] border-t border-gray-200">
      <div className="m-2 mx-auto px-6 md:px-10 py-12 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4  text-gray-700">
        {/* Brand & Contact Section */}
        <div className="flex flex-col items-start max-w-sm">
          <div className="flex gap-2 mb-5 items-center">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logo}
                alt="Shopora"
                className="h-12 w-12 object-contain"
              />

              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold text-[#15877F]">Shopora</span>
                <span className="text-xs tracking-wider text-gray-500">
                  SHOP SMART
                </span>
              </div>
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-sm mb-4">
            <h2 className="text-base font-bold text-black mb-1">Contact</h2>
            <p>
              <span className="font-semibold">Address:</span> Poornima
              University, Jaipur
            </p>
            <p>
              <span className="font-semibold">Phone:</span> 8058xxxx48
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-black">Follow Us</h2>
            <div className="flex flex-wrap gap-3 mt-1">
              <a href="" className="hover:text-black">
                <svg
                  className="h-4 w-4"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Instagram</title>
                  <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
                </svg>
              </a>
              <a href="" className="hover:text-black">
                <svg
                  className="h-4 w-4"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Snapchat</title>
                  <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
                </svg>
              </a>
              <a href="" className="hover:text-black">
                <svg
                  className="h-4 w-4"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Facebook</title>
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                </svg>
              </a>
              <a href="" className="hover:text-black">
                <svg
                  className="h-4 w-4"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>YouTube</title>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93 .502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <h2 className="text-base font-bold text-black mb-1">About</h2>

          <Link to="/about" className="hover:underline">
            About Us
          </Link>
          <Link to="/" className="hover:underline">
            Delivery Information
          </Link>
          <Link to="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link to="/terms-conditions" className="hover:underline">
            Terms & Conditions
          </Link>
          <Link to="/contact" className="hover:underline">
            Contact Us
          </Link>
        </div>

        {/* My Account Section */}
        <div className="flex flex-col gap-2 text-sm">
          <h2 className="text-base font-bold text-black mb-1">My Account</h2>
          {!currentUser && (
            <Link to="/login" className="hover:underline">
              Sign In
            </Link>
          )}
          <Link to="/cart" className="hover:underline">
            View Cart
          </Link>
          <Link to="/" className="hover:underline">
            My Wishlist
          </Link>
          <Link to="/profile" className="hover:underline">
            Track My Order
          </Link>
          <Link to="/contact" className="hover:underline">
            Help
          </Link>
        </div>

        {/* Install App Section */}
        <div className="flex flex-col gap-1 text-sm max-w-xs">
          <h2 className="text-base font-bold text-black mb-1">Install App</h2>
          <p>From App Store or Play Store</p>
          <div className="flex gap-2">
            <img
              className="w-24 object-contain rounded"
              src="https://raw.githubusercontent.com/pioug/google-play-badges/84247f16ddb0ebd9cfc2459085c2b6c7a43f3237/svg/af.svg"
              alt="Google Play"
            />
            <img
              className="w-24 object-contain rounded"
              src="https://www.svgrepo.com/show/303128/download-on-the-app-store-apple-logo.svg"
              alt="App Store"
            />
          </div>
          <p>Secure Payment Gateways</p>
          <div className="mt-1">
            <img
              className="h-8 w-auto object-contain"
              src={paymentGatewaysImg}
              alt="Payment Gateways"
            />
          </div>
        </div>

        <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
          <p>©2026 - MERN Ecommerce Project</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
