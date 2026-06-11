import React from 'react';

const Contact = () => {
  
  return (
    <div className="bg-gray-50 py-16 px-4 md:px-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 text-center">
          Get In Touch
        </h1>
        <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
          Have questions, feedback, or need support? We’d love to hear from you. 
          Fill out the form below or reach out to us through our contact details.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Details Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
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
                <p className="text-gray-600">Poornima University, Jaipur, India</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088178] focus:border-transparent outline-none" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088178] focus:border-transparent outline-none" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#088178] focus:border-transparent outline-none" placeholder="How can we help?"></textarea>
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