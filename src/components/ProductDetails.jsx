import React from "react";
import { Link, useParams } from "react-router-dom";

const ProductDetails = (props) => {
  const productList = [
    {
      id: 0,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      alt: "Boat Premium Wireless Headphone",
      brand: "Boat",
      name: "Premium Wireless Headphone",
      price: 450,
      description: "Enjoy high-fidelity sound with our premium wireless headphones. Featuring 40mm drivers for rich, deep bass and a 20-hour battery life, these headphones are built for all-day comfort with plush ear cushions and a lightweight, adjustable headband."
    },
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
      alt: "Noise Sleek Smart Watch v2",
      brand: "Noise",
      name: "Sleek Smart Watch v2",
      price: 1299,
      description: "Stay on top of your health and notifications with the Noise Sleek Smart Watch. Equipped with a vivid touchscreen display, heart-rate monitoring, and multi-sport tracking modes, it’s the perfect companion for your active lifestyle."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&q=80",
      alt: "Logitech Ergonomic Wireless Mouse",
      brand: "Logitech",
      name: "Ergonomic Wireless Mouse",
      price: 899,
      description: "Boost your productivity with the Logitech ergonomic mouse. Its sculpted design supports your hand naturally to reduce strain, while the high-precision optical sensor ensures smooth tracking on almost any surface."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80",
      alt: "JBL Bass-Boost Bluetooth Speaker",
      brand: "JBL",
      name: "Bass-Boost Bluetooth Speaker",
      price: 2499,
      description: "Take your music anywhere with this powerful, portable Bluetooth speaker. Featuring JBL’s signature Bass-Boost technology, it delivers punchy low-end sound and is IPX7 waterproof, making it ideal for pool parties or outdoor adventures."
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80",
      alt: "Sony Over-Ear Noise Cancelling Headphones",
      brand: "Sony",
      name: "Over-Ear Noise Cancelling Headphones",
      price: 7999,
      description: "Immerse yourself in silence with Sony’s advanced noise-cancelling technology. Designed for audiophiles, these headphones offer crystal-clear highs and deep, balanced mids, wrapped in a professional-grade, noise-isolating frame."
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&q=80",
      alt: "Redgear RGB Mechanical Gaming Keyboard",
      brand: "Redgear",
      name: "RGB Mechanical Gaming Keyboard",
      price: 1850,
      description: "Dominate the game with this mechanical keyboard, featuring tactile switches for lightning-fast responsiveness and fully customizable RGB lighting effects to match your unique gaming setup."
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80",
      alt: "HP Ultra-Slim 1080p Monitor",
      brand: "HP",
      name: "Ultra-Slim 1080p Monitor",
      price: 8500,
      description: "Upgrade your workspace with this stunning 1080p monitor. With its ultra-slim bezels, vibrant color reproduction, and anti-glare screen, it provides a cinematic viewing experience for work or entertainment."
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80",
      alt: "Portronics 20000mAh Fast Charging Power Bank",
      brand: "Portronics",
      name: "20000mAh Fast Charging Power Bank",
      price: 1199,
      description: "Never run out of battery again. This high-capacity 20000mAh power bank supports dual-device fast charging, featuring a sleek, portable design that keeps your phone, tablet, and other gadgets powered up on the go."
    },
  ];

  const { productId } = useParams();
  const product = productList[productId];

  // Agar productId wrong ho ya product na mile
  if (!product) {
    return <div className="p-10 text-center text-xl">Product not found!</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Link 
  to="/products" 
  className="group inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-[#088178] hover:text-white hover:border-[#088178] transition-all duration-300 shadow-sm font-semibold text-sm mb-6"
>
  <span className="text-lg group-hover:-translate-x-1 transition-transform duration-300">&larr;</span>
  Back
</Link>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="bg-gray-100 rounded-2xl p-4 flex justify-center">
          <img 
            src={product.image} 
            alt={product.alt} 
            className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md" 
          />
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{product.brand}</h2>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-2xl font-bold text-indigo-600">₹{product.price}</p>
          
          <div className="border-t pt-6 mt-4">
            <h3 className="text-lg font-semibold mb-2">Product Description</h3>
            <p className="text-gray-600 leading-relaxed text-justify">
              {product.description}
            </p>
          </div>
          
          <button className="bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 mt-4 cursor-pointer">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;