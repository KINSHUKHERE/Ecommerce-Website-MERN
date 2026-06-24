import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-150 shadow-md p-6 sm:p-10">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 px-5 py-2 bg-slate-50 border border-gray-200 text-gray-700 rounded-full hover:bg-[#15877F] hover:text-white hover:border-[#15877F] transition-all duration-300 font-semibold text-xs uppercase tracking-wider"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Title Header */}
        <div className="text-center pb-8 border-b border-gray-100 mb-8">
          <div className="w-12 h-12 bg-[#15877F]/10 rounded-2xl flex items-center justify-center text-[#15877F] mx-auto mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            Last Updated: June 24, 2026
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-6 text-gray-660 text-sm sm:text-base leading-relaxed text-justify">
          <p>
            At <strong>Veltiq</strong>, we prioritize the privacy and security of our users. This Privacy Policy details how we collect, store, utilize, and protect your personal information when you use our e-commerce platform.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">1. Information We Collect</h2>
            <p>
              We collect information that you voluntarily provide to us when creating an account, placing orders, or contacting support. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li><strong>Personal details</strong>: Name, email address, password (stored as a secure hash), and telephone number.</li>
              <li><strong>Shipping details</strong>: Recipient name, address, city, state, and PIN code.</li>
              <li><strong>Transaction details</strong>: Cart details, selected payment methods, and transaction reference numbers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">2. How We Use Your Information</h2>
            <p>
              Your information is used solely to provide and improve our e-commerce services, including:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Processing, billing, and shipping your purchased products.</li>
              <li>Maintaining and validating your active authentication session.</li>
              <li>Managing and responding to customer support queries and contact requests.</li>
              <li>Securing our database endpoints and preventing fraudulent operations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">3. Cookies and Local Storage</h2>
            <p>
              We use local storage keys (such as storing your active user token and credentials) and local cookies to maintain a seamless session. These help us keep you logged in and ensure that your shopping cart contents are preserved across refreshes. You can manage cookie settings directly in your browser.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">4. Data Encryption and Security</h2>
            <p>
              We implement industry-standard database security measures. All user passwords are encrypted using strong salting and hashing protocols (specifically via <code>bcryptjs</code>) before database entry. Data transmission between frontend and backend is secured using encrypted communication protocols.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">5. Third-Party Integrations</h2>
            <p>
              We do not sell, trade, or rent your personal information to external marketing agencies. Your details are shared only with trusted third parties strictly necessary to perform operations, such as standard payment gateway processors and logistics/delivery partners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">6. Your Privacy Rights</h2>
            <p>
              You have the right to access, edit, or delete your personal profile details directly inside your profile settings panel. If you wish to delete your account entirely or query stored purchase histories, please reach out to our privacy team.
            </p>
          </section>

          <div className="pt-8 border-t border-gray-100 mt-8 text-center text-xs text-gray-400">
            <p>For questions or concerns regarding this policy, contact our compliance team at privacy@veltiq.com.</p>
            <p className="mt-1">Poornima University, Jaipur, Rajasthan, India</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
