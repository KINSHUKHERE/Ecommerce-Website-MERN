const mongoose = require("mongoose");

const contactSchema = mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
    },
    Message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Contact = mongoose.model("contact", contactSchema);

module.exports = Contact;
