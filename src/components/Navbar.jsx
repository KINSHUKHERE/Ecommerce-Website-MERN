import React, { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-[#E3E6F3] sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="flex justify-between w-full h-18 px-4 md:px-6 py-4 items-center">
        <div className="flex gap-2 px-3 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 40 40"
            fill="none"
            id="Logo"
          >
            <g id="logomark">
              <path
                d="M20 0C9.50659 0 1 8.50659 1 19V20.1719L4 23.1719V19C4 10.1634 11.1634 3 20 3C28.8366 3 36 10.1634 36 19V23.1719L39 20.1719V19C39 8.50659 30.4934 0 20 0ZM20 10C15.0294 10 11 14.0294 11 19V31.0498C11 31.5743 10.5743 32 10.0498 32C9.7981 31.9999 9.55691 31.8997 9.37891 31.7217L0 22.3428V26.585L7.25781 33.8428C7.99842 34.5834 9.00245 34.9999 10.0498 35C12.2312 35 14 33.2312 14 31.0498V19C14 15.6863 16.6863 13 20 13C23.3137 13 26 15.6863 26 19V31.0498C26 33.2312 27.7688 35 29.9502 35C30.9976 34.9999 32.0016 34.5834 32.7422 33.8428L34.7066 31.8785L37.7066 28.8785L40 26.585V22.3428L37.8789 24.4639L35.5854 26.7574L32.5854 29.7574L30.6211 31.7217C30.4431 31.8997 30.2019 31.9999 29.9502 32C29.4257 32 29 31.5743 29 31.0498V19C29 14.0294 24.9706 10 20 10ZM20 15C17.7909 15 16 16.7909 16 19V31.0498C16 34.3358 13.3358 37 10.0498 37C8.47201 36.9999 6.95846 36.3735 5.84277 35.2578L0 29.4141V33.6562L3.72168 37.3789C5.39997 39.0572 7.67636 39.9999 10.0498 40C14.9926 40 19 35.9926 19 31.0498V19C19 18.4477 19.4477 18 20 18C20.5523 18 21 18.4477 21 19V31.0498C21 35.9926 25.0074 40 29.9502 40C32.3236 39.9999 34.6 39.0572 36.2783 37.3789L40 33.6562V29.4141L34.1572 35.2578C33.0415 36.3735 31.528 36.9999 29.9502 37C26.6642 37 24 34.3358 24 31.0498V19C24 16.7909 22.2091 15 20 15ZM20 5C12.268 5 6 11.268 6 19V25.1719L9 28.1719V19C9 12.9249 13.9249 8 20 8C26.0751 8 31 12.9249 31 19V28.1719L34 25.1719V19C34 11.268 27.732 5 20 5Z"
                fill="#FF3902"
              ></path>
            </g>
          </svg>
          <h1 className="text-xl md:text-2xl font-semibold whitespace-nowrap">ELECTRONIC STORE</h1>
        </div>

        <div className="hidden md:flex items-center gap-6 px-4 list-none">
          <li className="hover:text-[#15877F] cursor-pointer transition-colors">
            <a href="/">Home</a>
          </li>
          <li className="hover:text-[#15877F] cursor-pointer transition-colors">
            <a href="/products">Products</a>
          </li>
          <li className="hover:text-[#15877F] cursor-pointer transition-colors">
            <a href="/about">About Us</a>
          </li>
          <li className="hover:text-[#15877F] cursor-pointer transition-colors">
            <a href="/contact">Contact Us</a>
          </li>
          <li className="hover:text-[#15877F] cursor-pointer transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-heart"
            >
              <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
            </svg>
          </li>
          <li className="hover:text-[#15877F] cursor-pointer transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-shopping-cart"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </li>
        </div>

        <div className="flex items-center gap-4 md:hidden px-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-shopping-cart hover:text-[#15877F] cursor-pointer"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-900 focus:outline-none hover:text-[#15877F]"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`${
          isOpen ? "block" : "hidden"
        } md:hidden bg-[#E3E6F3] border-t border-gray-300 shadow-inner px-6 py-4 transition-all duration-300`}
      >
        <ul className="flex flex-col gap-4 list-none font-medium">
          <li className="hover:text-[#15877F] cursor-pointer py-1 border-b border-gray-200/50">
            <a href="/" onClick={() => setIsOpen(false)} className="block w-full">Home</a>
          </li>
          <li className="hover:text-[#15877F] cursor-pointer py-1 border-b border-gray-200/50">
            <a href="/products" onClick={() => setIsOpen(false)} className="block w-full">Products</a>
          </li>
          <li className="hover:text-[#15877F] cursor-pointer py-1 border-b border-gray-200/50">
            <a href="/about" onClick={() => setIsOpen(false)} className="block w-full">About Us</a>
          </li>
          <li className="hover:text-[#15877F] cursor-pointer py-1 border-b border-gray-200/50">
            <a href="/contact" onClick={() => setIsOpen(false)} className="block w-full">Contact Us</a>
          </li>
          <li className="hover:text-[#15877F] cursor-pointer py-1 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-heart"
            >
              <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
            </svg>
            <span>Wishlist</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;