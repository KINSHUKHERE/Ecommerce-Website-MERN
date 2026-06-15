import React from "react";

const ContactDetails = () => {
  const contacts = [
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      message: "I want to know more about your products.",
      time: "15 Jun 2026, 10:30 AM",
    },
    {
      id: 2,
      name: "Priya Verma",
      email: "priya@gmail.com",
      message: "My order has not been delivered yet.",
      time: "15 Jun 2026, 11:15 AM",
    },
    {
      id: 3,
      name: "Amit Jain",
      email: "amit@gmail.com",
      message: "Can you provide bulk order discounts?",
      time: "15 Jun 2026, 01:45 PM",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Contact Queries
        </h1>

        <p className="text-gray-500 mb-6">
          View messages submitted by users through the contact form.
        </p>

        {contacts.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-600">
              No Contact Queries Found
            </h2>

            <p className="text-gray-400 mt-2">
              Users haven't submitted any messages yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#15877F] text-white">
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Message</th>
                  <th className="p-4 text-left">Time</th>
                </tr>
              </thead>

              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium">{contact.name}</td>

                    <td className="p-4 text-blue-600">
                      {contact.email}
                    </td>

                    <td className="p-4 max-w-md">
                      {contact.message}
                    </td>

                    <td className="p-4 text-gray-500">
                      {contact.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactDetails;