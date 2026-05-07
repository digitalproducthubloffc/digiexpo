const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    // Check if credentials exist
    if (!user || user === 'placeholder@gmail.com' || !pass) {
      console.log('🚀 [SIMULATION] OTP Email Body for', to, ':', html);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS - works on Render free tier
      family: 4,     // Force IPv4
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });

    // Verify connection configuration
    await transporter.verify();
    console.log('✅ Mailer connection verified. Attempting to send...');

    await transporter.sendMail({
      from: `"DigiExpo Support" <${user}>`,
      to,
      subject,
      html
    });

    console.log(`📧 Email sent successfully to ${to}`);
  } catch (error) {
    console.error('❌ CRITICAL MAILER ERROR:', error.message);
    if (error.message.includes('Invalid login')) {
       console.log('👉 Tip: Double check your Google App Password. It must be exactly 16 characters with no spaces.');
    }
    // Fallback log so you can still see the code in the terminal during debug
    console.log('🚀 [SIMULATION FALLBACK] OTP Content:', html);
  }
};

module.exports = sendEmail;
