import React, { useEffect, useState } from "react";
import { getContact } from "../../api/ContactApi";

const ContactDetails = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      const data = await getContact();
      console.log(data);
      setContacts(data.data.contacts);
    } catch (err) {
      console.log("Unable to fetch the contacts Details");
    }
  };

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
                {contacts.map((contact, idx) => (
                  <tr
                    key={contact._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium">{contact.Name}</td>

                    <td className="p-4 text-blue-600">{contact.Email}</td>

                    <td className="p-4 max-w-md">{contact.Message}</td>

                    <td className="p-4 text-gray-500">
                      {new Date(contact.createdAt).toLocaleTimeString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
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
