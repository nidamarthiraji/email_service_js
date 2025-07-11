const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load .env

// Mailgun API Provider
const mailgunProvider = async (email) => {
  try {
    const url = `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`;
    const params = new URLSearchParams();
    params.append('from', process.env.MAILGUN_FROM_EMAIL);
    params.append('to', email.to);
    params.append('subject', email.subject);
    params.append('text', email.body);

    const response = await axios.post(url, params, {
      auth: {
        username: 'api',
        password: process.env.MAILGUN_API_KEY,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return {
      success: response.status === 200,
      provider: 'Mailgun',
    };
  } catch (error) {
    console.error('Mailgun Error:', error.message);
    return { success: false, provider: 'Mailgun' };
  }
};

// AWS SES SMTP Provider
const awsProvider = async (email) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.AWS_SMTP_HOST,
      port: parseInt(process.env.AWS_SMTP_PORT),
      auth: {
        user: process.env.AWS_SMTP_USER,
        pass: process.env.AWS_SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.AWS_FROM_EMAIL,
      to: email.to,
      subject: email.subject,
      text: email.body,
    });

    return {
      success: !!info.messageId,
      provider: 'AWS SES',
    };
  } catch (error) {
    console.error('AWS SES Error:', error.message);
    return { success: false, provider: 'AWS SES' };
  }
};

module.exports = {
  mailgunProvider,
  awsProvider,
};
