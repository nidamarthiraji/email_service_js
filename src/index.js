//console.log('Email Service running...');
const dotenv = require('dotenv');
dotenv.config();
const { EmailService } = require('./services/EmailService');

const service = new EmailService();

const testEmail = {
  to: 'user@example.com',
  subject: 'Demo Email',
  body: 'This is a test email from Raji chelli.',
  idempotencyKey: 'demo-key-001'
};

(async () => {
  console.log(' Sending test email...\n');
  const result = await service.sendEmail(testEmail);
  console.log('\n Final Status:', result);
})();

