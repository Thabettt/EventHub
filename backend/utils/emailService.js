const nodemailer = require("nodemailer");

// Create email transporter with more specific settings
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true, // This helps see detailed connection information
});

// Test the connection when server starts
transporter.verify(function (error, success) {
  if (error) {
    console.log("Email server error:", error);
  } else {
    console.log("Email server is ready to take our messages");
  }
});

module.exports = transporter;
