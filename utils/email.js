const fs = require('fs');
const path = require('path');
const emailHeader = fs.readFileSync(path.join(__dirname, '../templates/header.html'), 'utf8');
const emailFooter = fs.readFileSync(path.join(__dirname, '../templates/footer.html'), 'utf8');
const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
  // Check if custom SMTP settings are provided
  if (process.env.EMAIL_HOST) {
    console.log('Using custom SMTP:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER
    });
    
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 465,
      // secure: parseInt(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
      secure:true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      }
    });
  } else {
    // Default to Gmail
    console.log('Using Gmail service');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });
  }
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verification Code for Tours App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
         
          ${emailHeader}
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Verification Code</h2>
            <p style="color: #666; font-size: 16px;">Your OTP for registration is:</p>
            <div style="background-color: white; padding: 20px; text-align: center; margin: 20px 0; border: 2px solid #4CAF50; border-radius: 5px;">
              <h1 style="color: #4CAF50; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">This OTP will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
          </div>
          
          ${emailFooter}
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};


// Send Reset Password Email
const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Code - Tours App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${emailHeader}
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Reset Code</h2>
            <p style="color: #666; font-size: 16px;">Your password reset code is:</p>
            <div style="background-color: white; padding: 20px; text-align: center; margin: 20px 0; border: 2px solid #f44336; border-radius: 5px;">
              <h1 style="color: #f44336; margin: 0; font-size: 32px; letter-spacing: 5px;">${resetToken}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
          ${emailFooter}
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send Contact Form Email
const sendContactEmail = async (contactData) => {
  try {
    const transporter = createTransporter();
  
    const { name, lastname, email, phone, travelInterest, message } = contactData;

     console.log("✅ Trying to send email to:", email);
    // console.log("📤 Using SMTP:", process.env.EMAIL_HOST, process.env.EMAIL_PORT);
    // console.log("📧 Sending from:", process.env.EMAIL_USER);

    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting us!',
      html: `
        ${emailHeader}
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello ${name} 👋</h2>
          <p style="color: #666;">Thank you for contacting us regarding your interest in <b>${travelInterest}</b>.</p>
          <p style="color: #666;">We’ve received your message and our team will get back to you soon.</p>
          <p style="margin-top: 15px; color: #555;">Your Message:</p>
          <blockquote style="border-left: 4px solid #4CAF50; padding-left: 10px; color: #333;">${message}</blockquote>
          <p>Best regards,<br/>Tours Support Team</p>
        </div>
        ${emailFooter}
      `
    };

    const userMailInfo=await transporter.sendMail(userMailOptions)
    console.log("✅ User email sent:", userMailInfo.messageId);

     const adminTransporter = createTransporter();

    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // send to admin or default email
      subject: 'New Contact Inquiry Received',
      html: `
        ${emailHeader}
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">New Contact Inquiry</h2>
          <p><b>Name:</b> ${name} ${lastname}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Travel Interest:</b> ${travelInterest}</p>
          <p><b>Message:</b><br/>${message}</p>
        </div>
        ${emailFooter}
      `
    };

    const adminMailInfo = await adminTransporter.sendMail(adminMailOptions);
    console.log("✅ Admin email sent:", adminMailInfo.messageId);

    return { success: true, message: 'Emails sent successfully.' };
  } catch (error) {
    console.error('Error sending contact emails:', error);
    return { success: false, error: error.message };
  }
};

// Send Booking Confirmation Email
const sendBookingEmail = async (bookingData) => {
  try {
    const transporter = createTransporter();
    const { fullName, email, phone, destination, packageType, travelers, travelDate, message } = bookingData;

    console.log("✅ Trying to send booking email to:", email);

    // 📧 User confirmation email
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Booking Confirmation - ${destination}`,
      html: `
        ${emailHeader}
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello ${fullName} 👋</h2>
          <p style="color: #666;">Thank you for booking your trip with us!</p>
          <p style="color: #666;">Here are your booking details:</p>
          <ul style="color: #333; line-height: 1.6;">
            <li><b>Destination:</b> ${destination}</li>
            <li><b>Package Type:</b> ${packageType}</li>
            <li><b>Travelers:</b> ${travelers}</li>
            <li><b>Travel Date:</b> ${travelDate}</li>
            <li><b>Phone:</b> ${phone}</li>
          </ul>
          ${message ? `<p><b>Special Request:</b> ${message}</p>` : ""}
          <p style="margin-top: 15px;">Our team will contact you soon to finalize your trip details.</p>
          <p>Best regards,<br/>Tours Booking Team</p>
        </div>
        ${emailFooter}
      `
    };

    const userMailInfo = await transporter.sendMail(userMailOptions);
    console.log("✅ Booking email sent to user:", userMailInfo.messageId);

    // 📧 Admin notification email
    const adminTransporter = createTransporter();
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: "New Booking Request Received",
      html: `
        ${emailHeader}
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">New Booking Request</h2>
          <p><b>Full Name:</b> ${fullName}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Destination:</b> ${destination}</p>
          <p><b>Package Type:</b> ${packageType}</p>
          <p><b>Travelers:</b> ${travelers}</p>
          <p><b>Travel Date:</b> ${travelDate}</p>
          ${message ? `<p><b>Special Request:</b> ${message}</p>` : ""}
        </div>
        ${emailFooter}
      `
    };

    // console.log("admin email=",process.env.ADMIN_EMAIL)
    const adminMailInfo = await adminTransporter.sendMail(adminMailOptions);
    console.log("✅ Admin booking email sent:", adminMailInfo.messageId);

    return { success: true, message: "Booking emails sent successfully" };
  } catch (error) {
    console.error("❌ Error sending booking email:", error);
    return { success: false, error: error.message };
  }
};



module.exports = {
  generateOTP,
  sendOTPEmail,
  sendResetPasswordEmail,
  sendContactEmail,
  sendBookingEmail
};





