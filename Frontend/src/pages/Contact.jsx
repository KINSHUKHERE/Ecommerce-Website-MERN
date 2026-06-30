import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { postContact } from "../api/ContactApi";

const Contact = () => {
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setIsAuthenticated(true);
      setFormData((prev) => ({
        ...prev,
        Name: user.name || "",
        Email: user.email || "",
      }));
    }
  }, []);

  const formDetails = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForm = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitted(false);

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setError("Please login or sign up first to submit this form.");
      return;
    }

    if (!formData.Name.trim() || !formData.Email.trim() || !formData.Message.trim()) {
      setError("All fields are required.");
      return;
    }

    try {
      const type = user.role === "vendor" ? "vendor" : "user";
      await postContact({ ...formData, type });
      setIsSubmitted(true);
      setFormData({
        Name: user.name || "",
        Email: user.email || "",
        Message: "",
      });
    } catch (err) {
      console.log("Error in sending data in contact details api : ", err);
      setError("Failed to send message. Please try again later.");
    }
  };

  return (
    <div className="bg-gray-50 py-16 px-4 md:px-20">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 text-center">
          Get In Touch
        </h1>
        <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
          Have questions, feedback, or need support? We’d love to hear from you.
          Fill out the form below or reach out to us through our contact
          details.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Details Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Contact Information
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900">Email Us</h3>
                <p className="text-gray-600">herekinshuk@gmail.com</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Call Us</h3>
                <p className="text-gray-600">+91 805844248</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Store Address</h3>
                <p className="text-gray-600">
                  Poornima University, Jaipur, India
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            {!isAuthenticated && (
              <div className="mb-6 p-4 bg-amber-50 text-amber-800 rounded-xl font-semibold text-center border border-amber-200 text-sm">
                ⚠️ You must be logged in to submit this form.{" "}
                <Link to="/login" className="underline font-bold text-[#088178] hover:text-[#06635c]">Log In</Link> or{" "}
                <Link to="/register" className="underline font-bold text-[#088178] hover:text-[#06635c]">Sign Up</Link>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl font-semibold text-center border border-red-200">
                ❌ {error}
              </div>
            )}

            {isSubmitted && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl font-semibold text-center border border-green-200">
                ✓ We will assist you soon...
              </div>
            )}

            <form className="space-y-4" onSubmit={(e) => handleForm(e)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="contact-name"
                  onChange={(e) => formDetails(e)}
                  value={formData.Name}
                  name="Name"
                  autoComplete="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088178] focus:border-transparent outline-none"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="contact-email"
                  name="Email"
                  onChange={formDetails}
                  value={formData.Email}
                  autoComplete="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088178] focus:border-transparent outline-none"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows="4"
                  onChange={formDetails}
                  name="Message"
                  value={formData.Message}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088178] focus:border-transparent outline-none"
                  placeholder="How can we help?"
                ></textarea>
              </div>
              <button className="w-full bg-[#088178] text-white py-3 rounded-lg font-semibold hover:bg-[#06635c] transition duration-300">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
