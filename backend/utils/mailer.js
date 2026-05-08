const { Resend } = require('resend');

const sendEmail = async (to, subject, html) => {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.log('🚀 [SIMULATION] No Resend API Key found. OTP Content:', html);
      return;
    }

    const resend = new Resend(resendApiKey);

    console.log(`✅ Attempting to send email via Resend to ${to}...`);

    const { data, error } = await resend.emails.send({
      from: 'DigiExpo Support <onboarding@resend.dev>', // Use onboarding@resend.dev for testing if your domain isn't verified yet
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('❌ CRITICAL MAILER ERROR (Resend):', error);
      console.log('🚀 [SIMULATION FALLBACK] OTP Content:', html);
      return;
    }

    console.log(`📧 Email sent successfully to ${to} (ID: ${data.id})`);
  } catch (error) {
    console.error('❌ UNEXPECTED MAILER ERROR:', error.message);
    console.log('🚀 [SIMULATION FALLBACK] OTP Content:', html);
  }
};

module.exports = sendEmail;
