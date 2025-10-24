// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(__dirname));
app.use(express.json());

// --------------------
// MongoDB Connection
// --------------------
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;

let dbConnected = false;
if (mongoUri) {
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    dbConnected = true;
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.warn('Continuing without DB - add a valid MONGODB_URI in .env to enable persistence.');
  });
} else {
  console.warn('No MongoDB URI found. Skipping DB connection. Add MONGODB_URI to .env to enable saving contacts.');
}

// --------------------
// Optional: Contact Schema
// --------------------
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// --------------------
// Email Route
// --------------------
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.json({ success: false, error: 'All fields are required.' });
  }

  // Save to MongoDB only if connected
  if (dbConnected) {
    try {
      const newContact = new Contact({ name, email, message });
      await newContact.save();
    } catch (err) {
      console.error('MongoDB save error:', err);
      // continue, don't block email sending
    }
  }

  // Validate email env vars before sending
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER or EMAIL_PASS not set. Skipping email send.');
    return res.json({ success: true, note: 'Saved (if DB enabled). Email not sent because SMTP not configured.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Portfolio Contact from ${name}`,
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error('Email sending error:', err);
    res.json({ success: false, error: 'Failed to send email.' });
  }
});

// --------------------
// Start Server
// --------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
