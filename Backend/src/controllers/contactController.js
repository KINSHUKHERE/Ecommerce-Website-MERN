const Contact = require("../models/contactDetails");

const postContactDetails = async (req, res) => {
  try {
    const contacts = await Contact.create(req.body);

    res.status(201).json({
      message: "Data sent successfully",
      contacts,
    });
  } catch (err) {
    console.log("Error while post the contact details");
    res.status(500).json({
      message: "Error while post the contact details: ",
    });
  }
};

const getContactDetails = async (req, res) => {
  try {
    const contacts = await Contact.find();
    console.log("Contact details fetched");
    res.status(200).json({
      msg: "Contact Detais fetched",
      contacts,
    });
  } catch (err) {
    console.log("Unable to getch contact details from db");
    res.status(401).json({
      message: "Unable to getch contact details from db",
      err,
    });
  }
};

module.exports = {
  postContactDetails,
  getContactDetails,
};
