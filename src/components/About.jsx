import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="bg-white py-16 px-4 md:px-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 text-center">
          About Us: Welcome to Electronic Store
        </h1>

        <p className="text-xl text-gray-600 mb-12 text-center font-medium">
          Innovation. Quality. Customer-First.
        </p>

        <p className="text-lg text-gray-600 mb-16 text-center leading-relaxed">
          At Electronic Store, we believe in bridging the gap between cutting-edge technology and your everyday lifestyle. Our journey began with a simple vision—to bring the world’s most advanced and reliable electronics to one place, just for you.
        </p>

        <div className="grid md:grid-cols-2 gap-12 items-center bg-gray-50 p-8 md:p-12 rounded-3xl mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 leading-relaxed">
              We started as a passionate project, driven by the desire to find the perfect balance between premium quality and affordability. Today, we are a trusted platform dedicated to providing not just products, but a better technological experience. Whether it's headphones for immersive sound, smart accessories to boost your productivity, or top-tier audio systems for home entertainment—we curate every item with care.
            </p>
          </div>
          <div className="bg-gray-200 h-64 rounded-2xl flex items-center justify-center text-gray-500">
            <img src="https://thumbs.dreamstime.com/b/couple-choosing-home-appliances-walking-electronics-store-happy-arm-joyfully-selecting-enjoying-their-time-404501592.jpg" alt="" />
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3 text-[#088178]">Curated Excellence</h3>
              <p className="text-gray-600">We only list products that we truly trust and believe in.</p>
            </div>
            <div className="p-6 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3 text-[#088178]">Customer-Centric</h3>
              <p className="text-gray-600">Your satisfaction is our top priority. We are always here for you.</p>
            </div>
            <div className="p-6 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3 text-[#088178]">Affordable Tech</h3>
              <p className="text-gray-600">Modern technology should be accessible to everyone, without compromising quality.</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 text-white p-10 md:p-16 rounded-3xl mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg leading-relaxed italic">
            "Making high-end technology accessible and easy to use for everyone." We want to ensure that every time you shop with us, you receive premium quality and complete peace of mind.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Us?</h2>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex gap-4">
              <span className="font-bold text-[#088178]">1.</span>
              <p><strong className="text-gray-900">Authentic Products:</strong> We source only genuine items from trusted brands and authorized retailers.</p>
            </div>
            <div className="flex gap-4">
              <span className="font-bold text-[#088178]">2.</span>
              <p><strong className="text-gray-900">Expert Guidance:</strong> From detailed product descriptions to feature breakdowns, we make sure you have all the information you need.</p>
            </div>
            <div className="flex gap-4">
              <span className="font-bold text-[#088178]">3.</span>
              <p><strong className="text-gray-900">Hassle-Free Experience:</strong> Enjoy a seamless checkout process and lightning-fast shipping.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;