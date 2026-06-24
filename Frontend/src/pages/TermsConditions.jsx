import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";

const TermsConditions = () => {
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
            <ShieldAlert size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            Last Updated: June 24, 2026
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-6 text-gray-660 text-sm sm:text-base leading-relaxed text-justify">
          <p>
            Welcome to <strong>Veltiq</strong>. These Terms & Conditions govern your use of our website, services, and transactions. By accessing or shopping on our platform, you agree to comply with and be bound by these terms. If you do not agree, please do not use our services.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">1. Account Security</h2>
            <p>
              When you create an account on Veltiq, you are responsible for maintaining the security and confidentiality of your credentials (email and password). You agree to accept responsibility for all activities that occur under your account. If you suspect unauthorized access, notify us immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">2. Products, Stock & Pricing</h2>
            <p>
              All products, prices, and stock levels are subject to change without prior notice. While we strive to show precise stock availability (e.g., items left or sold out status), discrepancy may occur. In such instances, we reserve the right to cancel orders and process full refunds. All prices listed on the store are in Indian Rupees (₹).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">3. Purchases, Billing & Payments</h2>
            <p>
              All purchases made through our 2-step checkout wizard are processed securely. You agree to provide current, complete, and accurate purchase and account details for all orders. Payment options include Credit/Debit Cards, UPI transfers, and Cash on Delivery (COD). Transactions are simulated securely for training/demonstration purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">4. Shipping & Delivery</h2>
            <p>
              Delivery timeframes are estimated and not guaranteed. Veltiq partners with standard courier services to deliver products across valid postal locations. Any delays caused by courier service issues, weather, or natural disruptions are outside our immediate liability.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">5. User Conduct & Restrictions</h2>
            <p>
              You are prohibited from using the platform for any illegal activities, uploading malicious files, scraping store catalog details, or attempting to compromise database security. Any violation will result in immediate termination of your user account and access privileges.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">6. Intellectual Property</h2>
            <p>
              All assets, including the brand name Veltiq, design frameworks, stylesheets, icons, product images, graphics, and codebase, are intellectual property of Veltiq and Poornima University. Reproducing or using these assets without written permission is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">7. Changes to Terms</h2>
            <p>
              We reserve the right to update or modify these Terms & Conditions at any time. Any changes will become effective immediately upon posting. Your continued use of the platform constitutes your agreement to the modified terms.
            </p>
          </section>

          <div className="pt-8 border-t border-gray-100 mt-8 text-center text-xs text-gray-400">
            <p>If you have any questions, please contact our support department at support@veltiq.com.</p>
            <p className="mt-1">Poornima University, Jaipur, Rajasthan, India</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
