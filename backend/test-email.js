import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testEmail = async () => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD.replace(/\s/g, '')
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ Email connection verified');

    // Send test email
    const result = await transporter.sendMail({
      from: `"MindSettler Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email - MindSettler',
      html: `
        <h2>Test Email</h2>
        <p>If you receive this email, your email configuration is working correctly!</p>
        <p>Time: ${new Date().toISOString()}</p>
      `
    });

    console.log('✅ Test email sent successfully:', result.messageId);
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.response) console.error('SMTP response:', error.response);
  }
};

testEmail();