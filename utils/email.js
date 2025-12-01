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
      port: parseInt(process.env.EMAIL_PORT) || 587,
      // secure: parseInt(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
      secure:port===465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      // tls: {
      //   rejectUnauthorized: false // Accept self-signed certificates
      // }
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
// const sendOTPEmail = async (email, otp) => {
//   try {
//     const transporter = createTransporter();
    
//     const mailOptions = {
//       from: `"Jaipur-Thailand Tour" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: '✅ Verification Code - Jaipur-Thailand Tour',
//       html: `
//         ${emailHeader}
//         <div style="padding: 40px;">
//           <!-- Welcome Header -->
//           <div style="text-align: center; margin-bottom: 30px;">
            
//             <h2 style="color: #1e293b; margin: 0 0 12px 0; font-size: 24px; font-weight: 600;">
//               Verify Your Email Address
//             </h2>
//             <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">
//               Welcome to Jaipur-Thailand Tour! Use the code below to complete your registration.
//             </p>
//           </div>

//           <!-- OTP Code Section -->
//           <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 16px; padding: 32px; margin: 30px 0; text-align: center;">
//             <h3 style="color: #065f46; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
//               Your Verification Code
//             </h3>
//             <div style="background: linear-gradient(135deg, #065f46 0%, #059669 100%); padding: 28px; border-radius: 16px; display: inline-block; margin: 16px 0; box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);">
//               <div style="font-family: 'Courier New', monospace; font-size: 42px; font-weight: 700; color: white; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
//                 ${otp}
//               </div>
//             </div>
//             <p style="color: #dc2626; margin: 16px 0 0 0; font-size: 14px; font-weight: 600;">
//               ⏰ Expires in 10 minutes
//             </p>
//           </div>

//           <!-- Instructions -->
//           <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 24px; margin: 30px 0;">
//             <h3 style="color: #0c4a6e; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
//               <span style="margin-right: 12px;">📱</span>
//               How to Verify Your Account
//             </h3>
//             <ol style="color: #0369a1; margin: 0; padding-left: 20px; line-height: 1.6;">
//               <li>Return to the verification page</li>
//               <li>Enter the 6-digit code shown above</li>
//               <li>Click "Verify Email" to complete registration</li>
//               <li>Start exploring amazing travel experiences!</li>
//             </ol>
//           </div>

//           <!-- Security Notice -->
//           <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px; margin: 30px 0;">
//             <div style="display: flex; align-items: start; gap: 12px;">
//               <div style="background: #d97706; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
//                 <span style="color: white; font-size: 14px; font-weight: bold;">!</span>
//               </div>
//               <div>
//                 <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
//                   Important Security Information
//                 </h4>
//                 <ul style="color: #92400e; margin: 0; padding-left: 16px; line-height: 1.5; font-size: 14px;">
//                   <li>This code is for your registration only</li>
//                   <li>Never share your verification code with anyone</li>
//                   <li>Our team will never ask for this code</li>
//                   <li>If you didn't request this code, please ignore this email</li>
//                 </ul>
//               </div>
//             </div>
//           </div>

//           <!-- Next Steps -->
//           <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center;">
//             <h4 style="color: #475569; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
//               What's Next After Verification?
//             </h4>
//             <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">
//               Once verified, you'll get access to exclusive travel deals,<br>
//               personalized itineraries, and 24/7 travel support!
//             </p>
//           </div>

//           <!-- Support Section -->
//           <div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 12px;">
//             <p style="color: #475569; margin: 0; font-size: 14px;">
//               Need help? Contact us at 
//               <a href="mailto:support@jaipur-thailand.com" style="color: #3b82f6; text-decoration: none; font-weight: 500;">
//                 support@jaipur-thailand.com
//               </a>
//             </p>
//           </div>
//         </div>
//         ${emailFooter}
//       `
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log('✅ OTP email sent: ' + info.messageId);
//     return { success: true, messageId: info.messageId };
//   } catch (error) {
//     console.error('❌ Error sending OTP email:', error);
//     return { success: false, error: error.message };
//   }
// };


const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Jaipur-Thailand Tour" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✅ Verification Code - Jaipur-Thailand Tour',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - Jaipur-Thailand Tour</title>
          <style>
            @media only screen and (max-width: 600px) {
              .container {
                width: 100% !important;
                padding: 0 !important;
              }
              .content {
                padding: 20px !important;
              }
              .otp-code {
                font-size: 32px !important;
                letter-spacing: 6px !important;
                padding: 20px !important;
              }
              .otp-container {
                padding: 20px !important;
                margin: 20px 0 !important;
              }
              .security-notice {
                padding: 16px !important;
              }
              .instructions {
                padding: 20px !important;
              }
              .next-steps {
                padding: 20px !important;
              }
              .support-section {
                padding: 16px !important;
              }
              h2 {
                font-size: 22px !important;
              }
              h3 {
                font-size: 18px !important;
              }
              p {
                font-size: 14px !important;
              }
              li {
                margin-bottom: 8px !important;
                font-size: 14px !important;
              }
              .mobile-center {
                text-align: center !important;
              }
              .mobile-stack {
                display: block !important;
              }
              .mobile-padding {
                padding: 12px !important;
              }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          ${emailHeader}
          <div class="container" style="max-width: 600px; margin: 0 auto; background: white;">
            <div class="content" style="padding: 40px;">

              <!-- Welcome Header -->
              <div style="text-align: center; margin-bottom: 30px;" class="mobile-center">
                <h2 style="color: #1e293b; margin: 0 0 12px 0; font-size: 24px; font-weight: 600;">
                  Verify Your Email Address
                </h2>
                <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">
                  Welcome to Jaipur-Thailand Tour! Use the code below to complete your registration.
                </p>
              </div>

              <!-- OTP Code Section -->
              <div class="otp-container" style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 16px; padding: 32px; margin: 30px 0; text-align: center;">
                <h3 style="color: #065f46; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;" class="mobile-center">
                  Your Verification Code
                </h3>
                <div style="background: linear-gradient(135deg, #065f46 0%, #059669 100%); padding: 28px; border-radius: 16px; display: inline-block; margin: 16px 0; box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3); max-width: 100%;">
                  <div class="otp-code" style="font-family: 'Courier New', monospace; font-size: 42px; font-weight: 700; color: white; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); word-break: break-all; overflow-wrap: break-word;">
                    ${otp}
                  </div>
                </div>
                <p style="color: #dc2626; margin: 16px 0 0 0; font-size: 14px; font-weight: 600;" class="mobile-center">
                  ⏰ Expires in 10 minutes
                </p>
              </div>

              <!-- Instructions -->
              <div class="instructions" style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 24px; margin: 30px 0;">
                <h3 style="color: #0c4a6e; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center; justify-content: center;" class="mobile-stack mobile-center">
                  <span style="margin-right: 12px;">📱</span>
                  How to Verify Your Account
                </h3>
                <ol style="color: #0369a1; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">Return to the verification page</li>
                  <li style="margin-bottom: 8px;">Enter the 6-digit code shown above</li>
                  <li style="margin-bottom: 8px;">Click "Verify Email" to complete registration</li>
                  <li>Start exploring amazing travel experiences!</li>
                </ol>
              </div>

              <!-- Security Notice -->
              <div class="security-notice" style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px; margin: 30px 0;">
                <div style="display: flex; align-items: start; gap: 12px;" class="mobile-stack">
                  <div style="background: #d97706; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; align-self: center;">
                    <span style="color: white; font-size: 14px; font-weight: bold;">!</span>
                  </div>
                  <div style="flex: 1;">
                    <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600; text-align: center;" class="mobile-center">
                      Important Security Information
                    </h4>
                    <ul style="color: #92400e; margin: 0; padding-left: 16px; line-height: 1.5; font-size: 14px;">
                      <li style="margin-bottom: 6px;">This code is for your registration only</li>
                      <li style="margin-bottom: 6px;">Never share your verification code with anyone</li>
                      <li style="margin-bottom: 6px;">Our team will never ask for this code</li>
                      <li>If you didn't request this code, please ignore this email</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Next Steps -->
              <div class="next-steps" style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center;">
                <h4 style="color: #475569; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
                  What's Next After Verification?
                </h4>
                <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">
                  Once verified, you'll get access to exclusive travel deals,<br class="desktop-only">
                  personalized itineraries, and 24/7 travel support!
                </p>
              </div>

              <!-- Support Section -->
              <div class="support-section" style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 12px;">
                <p style="color: #475569; margin: 0; font-size: 14px;">
                  Need help? Contact us at 
                  <a href="mailto:support@jaipur-thailand.com" style="color: #3b82f6; text-decoration: none; font-weight: 500;">
                    codermat@gmail.com
                  </a>
                </p>
              </div>

            </div>
          </div>
          ${emailFooter}
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};


// Send Reset Password Email
const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Jaipur-Thailand Tour" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔒 Password Reset Code - Jaipur-Thailand Tour',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Jaipur-Thailand Tour</title>
          <style>
            @media only screen and (max-width: 600px) {
              .container {
                width: 100% !important;
                padding: 0 !important;
              }
              .content {
                padding: 20px !important;
              }
              .reset-code {
                font-size: 28px !important;
                letter-spacing: 6px !important;
                padding: 20px !important;
              }
              .reset-container {
                padding: 20px !important;
                margin: 20px 0 !important;
              }
              .instructions {
                padding: 20px !important;
              }
              .security-warning {
                padding: 16px !important;
              }
              .support-info {
                padding: 16px !important;
              }
              h2 {
                font-size: 22px !important;
              }
              h3 {
                font-size: 18px !important;
              }
              h4 {
                font-size: 16px !important;
              }
              p {
                font-size: 14px !important;
              }
              li {
                margin-bottom: 8px !important;
                font-size: 14px !important;
              }
              .mobile-center {
                text-align: center !important;
              }
              .mobile-stack {
                display: block !important;
              }
              .mobile-full-width {
                width: 100% !important;
                display: block !important;
              }
              .mobile-padding {
                padding: 12px !important;
              }
              .mobile-margin {
                margin: 8px 0 !important;
              }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          ${emailHeader}
          <div class="container" style="max-width: 600px; margin: 0 auto; background: white;">
            <div class="content" style="padding: 40px;">

              <!-- Security Header -->
              <div style="text-align: center; margin-bottom: 30px;" class="mobile-center">
                <h2 style="color: #1e293b; margin: 0 0 12px 0; font-size: 24px; font-weight: 600;">
                  Password Reset Request
                </h2>
                <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">
                  We received a request to reset your password for your Jaipur-Thailand Tour account.
                </p>
              </div>

              <!-- Reset Code Section -->
              <div class="reset-container" style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 32px; margin: 30px 0; text-align: center;">
                <h3 style="color: #475569; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;" class="mobile-center">
                  Your Security Code
                </h3>
                <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 24px; border-radius: 12px; display: inline-block; margin: 16px 0; max-width: 100%; box-sizing: border-box;">
                  <div class="reset-code" style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: white; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); word-break: break-all; overflow-wrap: break-word;">
                    ${resetToken}
                  </div>
                </div>
                <p style="color: #ef4444; margin: 16px 0 0 0; font-size: 14px; font-weight: 600;" class="mobile-center">
                  ⏰ Expires in 10 minutes
                </p>
              </div>

              <!-- Instructions -->
              <div class="instructions" style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 24px; margin: 30px 0;">
                <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center; justify-content: center;" class="mobile-stack mobile-center">
                  <span style="margin-right: 12px;">📝</span>
                  How to Use This Code
                </h3>
                <ol style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">Return to the password reset page</li>
                  <li style="margin-bottom: 8px;">Enter the 6-digit code above</li>
                  <li style="margin-bottom: 8px;">Create your new password</li>
                  <li>Login with your new credentials</li>
                </ol>
              </div>

              <!-- Security Warning -->
              <div class="security-warning" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 30px 0;">
                <div style="display: flex; align-items: start; gap: 12px;" class="mobile-stack">
                  <div style="background: #dc2626; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; align-self: center;">
                    <span style="color: white; font-size: 14px; font-weight: bold;">!</span>
                  </div>
                  <div style="flex: 1;">
                    <h4 style="color: #dc2626; margin: 0 0 8px 0; font-size: 16px; font-weight: 600; text-align: center;" class="mobile-center">
                      Security Alert
                    </h4>
                    <ul style="color: #b91c1c; margin: 0; padding-left: 16px; line-height: 1.5; font-size: 14px;">
                      <li style="margin-bottom: 6px;">Never share this code with anyone</li>
                      <li style="margin-bottom: 6px;">Our team will never ask for your code</li>
                      <li style="margin-bottom: 6px;">This code expires in 15 minutes for security</li>
                      <li>If you didn't request this, please ignore this email</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Support Info -->
              <div class="support-info" style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 12px;">
                <p style="color: #475569; margin: 0; font-size: 14px;">
                  Need help? Contact our support team at 
                  <a href="mailto:codermat@gmail.com" style="color: #3b82f6; text-decoration: none; font-weight: 500;">
                    codermat@gmail.com
                  </a>
                </p>
              </div>

            </div>
          </div>
          ${emailFooter}
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending reset password email:", error);
    return { success: false, error: error.message };
  }
};

// Send Contact Form Email
const sendContactEmail = async (contactData) => {
  try {
    const transporter = createTransporter();
  
    const { name, lastname, email, phone, travelInterest, message } = contactData;

    console.log("✅ Trying to send email to:", email);

    const userMailOptions = {
      from: `"Jaipur-Thailand Tour" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank You for Contacting Jaipur-Thailand Tour!',
      html: `
        ${emailHeader}
     <div style="
  padding: 40px;
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
">

  <div style="text-align: center; margin-bottom: 30px;">
    <h2 style="
      color: #1e293b;
      margin: 0 0 12px 0;
      font-size: 26px;
      font-weight: 700;
    ">
      Thank You, ${name}!
    </h2>

    <p style="
      color: #64748b;
      margin: 0;
      font-size: 16px;
      line-height: 1.6;
    ">
      We've received your inquiry about 
      <strong style="color: #1e40af;">${travelInterest}</strong>.<br/>
      We’re excited to assist you with your travel plan!
    </p>
  </div>

  <!-- Summary Card -->
  <div style="
    background: #f8fafc;
    border-radius: 12px;
    padding: 24px;
    margin: 30px 0;
    border: 1px solid #e2e8f0;
  ">
    <h3 style="
      color: #1e293b;
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
    ">
      <span style="
        background: #3b82f6;
        color: white;
        width: 26px;
        height: 26px;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        font-size: 14px;
      ">📝</span>
      Inquiry Summary
    </h3>

    <div style="display: grid; gap: 14px;">
      
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
        <span style="font-weight: 600; color: #475569;">Name:</span>
        <span style="color: #334155;">${name} ${lastname}</span>
      </div>

      <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
        <span style="font-weight: 600; color: #475569;">Travel Interest:</span>
        <span style="color: #334155;">${travelInterest}</span>
      </div>

      <div style="display: block;">
        <span style="font-weight: 600; color: #475569; display: block; margin-bottom: 6px;">Your Message:</span>
        <div style="
          background: #ffffff;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          color: #334155;
          line-height: 1.5;
          white-space: pre-wrap;
        ">
          ${message}
        </div>
      </div>

    </div>
  </div>

  <p style="text-align: center; color: #64748b; font-size: 14px;">
    Our team will contact you shortly.  
    <br/>Have a great day! 🌍✈️
  </p>

</div>


          <!-- Next Steps -->
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h3 style="color: #0c4a6e; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
              What Happens Next?
            </h3>
            <ul style="color: #0369a1; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Our travel expert will contact you within <strong>24 hours</strong></li>
              <li>We'll provide customized itinerary options</li>
              <li>Get the best prices and exclusive deals</li>
              <li>Complete travel assistance until you return home</li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div style="text-align: center; padding: 24px; background: #f1f5f9; border-radius: 12px;">
            <h4 style="color: #475569; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
              Need Immediate Assistance?
            </h4>
            <p style="color: #64748b; margin: 0; font-size: 14px;">
              📞 ${process.env.CONTACT_PHONE || '+91-9352056337'} | 
              ✉️ ${process.env.CONTACT_EMAIL || 'codermat@gmail.com'}
            </p>
          </div>
        </div>  
        ${emailFooter}
      `
    };

    const userMailInfo = await transporter.sendMail(userMailOptions);
    console.log("✅ User email sent:", userMailInfo.messageId);

    const adminMailOptions = {
      from: `"Jaipur-Thailand Tour" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `🚨 New Contact Inquiry - ${name} ${lastname} (${travelInterest})`,
      html: `
        ${emailHeader}
        <div style="padding: 40px;">
          <!-- Alert Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">
              New Contact Inquiry
            </h2>
            <p style="color: #64748b; margin: 0; font-size: 16px;">
              Interested in: <strong>${travelInterest}</strong>
            </p>
          </div>

          <!-- Customer Details -->
          <div style="background: #fef2f2; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h3 style="color: #dc2626; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
              <span style="background: #dc2626; color: white; width: 24px; height: 24px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 14px;">📋</span>
              Customer Details
            </h3>
            <div style="display: grid; gap: 16px;">
              <div style="display: flex; align-items: start;">
                <span style="font-weight: 600; color: #dc2626; min-width: 140px;">Full Name:</span>
                <span style="color: #334155;">${name} ${lastname}</span>
              </div>
              <div style="display: flex; align-items: start;">
                <span style="font-weight: 600; color: #dc2626; min-width: 140px;">Email:</span>
                <span style="color: #334155;">
                  <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
                </span>
              </div>
              <div style="display: flex; align-items: start;">
                <span style="font-weight: 600; color: #dc2626; min-width: 140px;">Phone:</span>
                <span style="color: #334155;">
                  <a href="tel:${phone}" style="color: #3b82f6; text-decoration: none;">${phone}</a>
                </span>
              </div>
              <div style="display: flex; align-items: start;">
                <span style="font-weight: 600; color: #dc2626; min-width: 140px;">Travel Interest:</span>
                <span style="color: #334155; background: #fecaca; padding: 4px 12px; border-radius: 20px; font-weight: 500;">${travelInterest}</span>
              </div>
              <div style="display: flex; align-items: start;">
                <span style="font-weight: 600; color: #dc2626; min-width: 140px;">Message:</span>
                <div style="color: #334155; flex: 1; background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #dc2626;">
                  ${message}
                </div>
              </div>
            </div>
          </div>

          <!-- Action Required -->
          <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
              ⚡ Action Required
            </h3>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Contact customer within <strong>24 hours</strong></li>
              <li>Prepare customized package for ${travelInterest}</li>
              <li>Follow up via email and phone</li>
              <li>Update CRM with customer response</li>
            </ul>
          </div>

          <!-- Submission Info -->
          <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #475569; margin: 0; font-size: 14px;">
              <strong>Received:</strong> ${new Date().toLocaleString('en-IN', { 
                timeZone: 'Asia/Kolkata',
                dateStyle: 'full', 
                timeStyle: 'long' 
              })}
            </p>
          </div>
        </div>
        ${emailFooter}
      `
    };

    const adminMailInfo = await transporter.sendMail(adminMailOptions);
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
      from: `"Jaipur-Thailand Tour" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎉 Booking Confirmation - ${destination} Package`,
      html: `
        ${emailHeader}
        <div style="padding: 40px;">
          <!-- Confirmation Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin: 0 0 12px 0; font-size: 24px; font-weight: 600;">
              Booking Confirmed!
            </h2>
            <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">
              Thank you for choosing Jaipur-Thailand Tour, ${fullName}!<br>
              Your ${destination} adventure is being prepared.
            </p>
          </div>

          <!-- Booking Details -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h3 style="color: #065f46; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
              <span style="background: #059669; color: white; width: 24px; height: 24px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 14px;">📅</span>
              Booking Details
            </h3>
            <div style="display: grid; gap: 16px;">
              <div style="display: flex; align-items: center;">
                <span style="font-weight: 600; color: #065f46; min-width: 140px;">Destination:</span>
                <span style="color: #334155; background: #dcfce7; padding: 6px 12px; border-radius: 20px; font-weight: 500;">🌍 ${destination}</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="font-weight: 600; color: #065f46; min-width: 140px;">Package Type:</span>
                <span style="color: #334155;">${packageType}</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="font-weight: 600; color: #065f46; min-width: 140px;">Travelers:</span>
                <span style="color: #334155;">👥 ${travelers} person(s)</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="font-weight: 600; color: #065f46; min-width: 140px;">Travel Date:</span>
                <span style="color: #334155;">📅 ${travelDate}</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="font-weight: 600; color: #065f46; min-width: 140px;">Contact:</span>
                <span style="color: #334155;">📞 ${phone}</span>
              </div>
              ${message ? `
                <div style="display: flex; align-items: start;">
                  <span style="font-weight: 600; color: #065f46; min-width: 140px;">Special Requests:</span>
                  <div style="color: #334155; flex: 1; background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #059669;">
                    ${message}
                  </div>
                </div>
              ` : ""}
            </div>
          </div>

          <!-- Next Steps -->
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h3 style="color: #0c4a6e; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
              🎯 What Happens Next?
            </h3>
            <ul style="color: #0369a1; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Our travel expert will contact you within <strong>2 hours</strong></li>
              <li>You'll receive detailed itinerary and pricing</li>
              <li>Complete payment to secure your booking</li>
              <li>Get travel documents and visa assistance</li>
              <li>24/7 support during your trip</li>
            </ul>
          </div>

          <!-- Contact Support -->
          <div style="text-align: center; padding: 24px; background: #f1f5f9; border-radius: 12px;">
            <h4 style="color: #475569; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
              Need Immediate Assistance?
            </h4>
            <p style="color: #64748b; margin: 0; font-size: 14px;">
              📞 ${process.env.CONTACT_PHONE || '+91 9352056337'} | 
              ✉️ ${process.env.CONTACT_EMAIL || 'codermat@gmail.com'}
            </p>
          </div>
        </div>
        ${emailFooter}
      `
    };

    const userMailInfo = await transporter.sendMail(userMailOptions);
    console.log("✅ Booking email sent to user:", userMailInfo.messageId);

    // 📧 Admin notification email
    const adminMailOptions = {
      from: `"Jaipur-Thailand Tour" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `🚨 NEW BOOKING: ${destination} - ${fullName}`,
      html: `
        ${emailHeader}
        <div style="padding: 40px;">
          <!-- Alert Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">
              New Booking Request!
            </h2>
            <p style="color: #64748b; margin: 0; font-size: 16px;">
              High priority - Contact within <strong style="color: #dc2626;">2 hours</strong>
            </p>
          </div>

          <!-- Booking Details -->
          <div style="background: #fef2f2; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h3 style="color: #dc2626; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
              <span style="background: #dc2626; color: white; width: 24px; height: 24px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 14px;">💰</span>
              Booking Details
            </h3>
            <div style="display: grid; gap: 16px;">
              <div style="display: flex; align-items: center;">
                <span style="font-weight: 600; color: #dc2626; min-width: 150px;">Customer:</span>
                <span style="color: #334155; font-weight: 500;">${fullName}</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="font-weight: 600; color: #dc2626; min-width: 150px;">Email:</span>
                <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="font-weight: 600; color: #dc2626; min-width: 150px;">Phone:</span>
                <a href="tel:${phone}" style="color: #3b82f6; text-decoration: none;">${phone}</a>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="font-weight: 600; color: #dc2626; min-width: 150px;">Destination:</span>
                <span style="color: #334155; background: #fecaca; padding: 6px 12px; border-radius: 20px; font-weight: 500;">${destination}</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="font-weight: 600; color: #dc2626; min-width: 150px;">Package:</span>
                <span style="color: #334155;">${packageType}</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="font-weight: 600; color: #dc2626; min-width: 150px;">Travelers:</span>
                <span style="color: #334155;">${travelers} person(s)</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="font-weight: 600; color: #dc2626; min-width: 150px;">Travel Date:</span>
                <span style="color: #334155; font-weight: 500;">${travelDate}</span>
              </div>
              ${message ? `
                <div style="display: flex; align-items: start;">
                  <span style="font-weight: 600; color: #dc2626; min-width: 150px;">Special Requests:</span>
                  <div style="color: #334155; flex: 1; background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #dc2626;">
                    ${message}
                  </div>
                </div>
              ` : ""}
            </div>
          </div>

          <!-- Urgent Action -->
          <div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
              ⚡ Urgent Action Required
            </h3>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Contact customer within <strong>2 hours</strong></li>
              <li>Prepare customized itinerary for ${destination}</li>
              <li>Calculate pricing for ${travelers} person(s)</li>
              <li>Check availability for ${travelDate}</li>
              <li>Follow up via phone and email</li>
            </ul>
          </div>

          <!-- Submission Info -->
          <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #475569; margin: 0; font-size: 14px;">
              <strong>Booking Received:</strong> ${new Date().toLocaleString('en-IN', { 
                timeZone: 'Asia/Kolkata',
                dateStyle: 'full', 
                timeStyle: 'long' 
              })}
            </p>
          </div>
        </div>
        ${emailFooter}
      `
    };

    const adminMailInfo = await transporter.sendMail(adminMailOptions);
    console.log("✅ Admin booking email sent:", adminMailInfo.messageId);

    return { success: true, message: "Booking emails sent successfully" };
  } catch (error) {
    console.error("❌ Error sending booking email:", error);
    return { success: false, error: error.message };
  }
};

// async function sendServiceEmail(payload, serviceType) {
//   try {
//     const transporter = createTransporter();

//     const user = payload.email;
//     const name = payload.name || "Customer";
//     const adminTo = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

//     // Compose a simple subject per service
//     const subject = `Thanks for your ${serviceType} request - Jaipur-Thailand Tour`;

//     // Build HTML summary of submitted data with better styling
//     const rows = Object.keys(payload)
//       .filter(k => k !== 'serviceType')
//       .map(k => {
//         const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
//         const value = payload[k] || 'Not provided';
//         return `
//           <tr>
//             <td style="padding:12px 16px; background:#f8fafc; border:1px solid #e2e8f0; font-weight:600; color:#475569; width:30%;">${label}</td>
//             <td style="padding:12px 16px; border:1px solid #e2e8f0; color:#334155; width:70%;">${value}</td>
//           </tr>
//         `;
//       })
//       .join("");

//     const userHtml = `
//       ${emailHeader}
//       <div style="padding:40px;">
//         <div style="text-align:center; margin-bottom:30px;">
        
//           <h2 style="color:#1e293b; margin:0 0 12px 0; font-size:24px; font-weight:600;">Thank You, ${name}!</h2>
//           <p style="color:#64748b; margin:0; font-size:16px; line-height:1.6;">
//             We've received your <strong style="color:#1e40af;">${serviceType}</strong> request and our team is already working on it.
//           </p>
//         </div>

//         <!-- Request Details -->
//         <div style="background:#f8fafc; border-radius:12px; padding:24px; margin:30px 0;">
//           <h3 style="color:#1e293b; margin:0 0 20px 0; font-size:18px; font-weight:600; display:flex; align-items:center;">
//             <span style="background:#3b82f6; color:white; width:24px; height:24px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; margin-right:12px; font-size:14px;">📋</span>
//             Request Details
//           </h3>
//           <table style="width:100%; border-collapse:collapse; border-radius:8px; overflow:hidden;">
//             ${rows}
//           </table>
//         </div>

//         <!-- Next Steps -->
//         <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; padding:24px; margin:30px 0;">
//           <h3 style="color:#0c4a6e; margin:0 0 16px 0; font-size:18px; font-weight:600;">What Happens Next?</h3>
//           <ul style="color:#0369a1; margin:0; padding-left:20px; line-height:1.6;">
//             <li>Our travel expert will contact you within <strong>24 hours</strong></li>
//             <li>We'll provide the best available options and prices</li>
//             <li>Get ready for an amazing travel experience!</li>
//           </ul>
//         </div>

//         <!-- Contact Info -->
//         <div style="text-align:center; padding:24px; background:#f1f5f9; border-radius:12px;">
//           <h4 style="color:#475569; margin:0 0 12px 0; font-size:16px; font-weight:600;">Need Immediate Assistance?</h4>
//           <p style="color:#64748b; margin:0; font-size:14px;">
//             📞 ${process.env.CONTACT_PHONE || '+91 9352056337'} | 
//             ✉️ ${process.env.CONTACT_EMAIL || 'codermat@gmail.com'}
//           </p>
//         </div>
//       </div>
//       ${emailFooter}
//     `;

//     const adminHtml = `
//       ${emailHeader}
//       <div style="padding:40px;">
//         <div style="text-align:center; margin-bottom:30px;">
//           <h2 style="color:#1e293b; margin:0 0 12px 0; font-size:24px; font-weight:600;">New ${serviceType} Request</h2>
//           <p style="color:#64748b; margin:0; font-size:16px;">
//             Received from <strong>${name}</strong> (${payload.email})
//           </p>
//         </div>

//         <!-- Customer Details -->
//         <div style="background:#fef2f2; border-radius:12px; padding:24px; margin:30px 0;">
//           <h3 style="color:#dc2626; margin:0 0 20px 0; font-size:18px; font-weight:600; display:flex; align-items:center;">
//             <span style="background:#dc2626; color:white; width:24px; height:24px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; margin-right:12px; font-size:14px;">👤</span>
//             Customer Information
//           </h3>
//           <table style="width:100%; border-collapse:collapse; border-radius:8px; overflow:hidden;">
//             ${rows}
//           </table>
//         </div>

//         <!-- Action Required -->
//         <div style="background:#fffbeb; border:1px solid #fcd34d; border-radius:12px; padding:24px; margin:30px 0;">
//           <h3 style="color:#92400e; margin:0 0 16px 0; font-size:18px; font-weight:600;">Action Required</h3>
//           <ul style="color:#92400e; margin:0; padding-left:20px; line-height:1.6;">
//             <li>Contact customer within <strong>24 hours</strong></li>
//             <li>Provide best available options and pricing</li>
//             <li>Update CRM with customer response</li>
//           </ul>
//         </div>

//         <!-- Submission Info -->
//         <div style="background:#f1f5f9; border-radius:8px; padding:16px; text-align:center;">
//           <p style="color:#475569; margin:0; font-size:14px;">
//             <strong>Submitted:</strong> ${new Date().toLocaleString('en-IN', { 
//               timeZone: 'Asia/Kolkata',
//               dateStyle: 'full', 
//               timeStyle: 'long' 
//             })}
//           </p>
//         </div>
//       </div>
//       ${emailFooter}
//     `;

//     // Send user email
//     await transporter.sendMail({
//       from: `"Jaipur-Thailand Tour" <${process.env.EMAIL_USER}>`,
//       to: user,
//       subject,
//       html: userHtml
//     });

//     // Send admin email
//     await transporter.sendMail({
//       from: `"Jaipur-Thailand Tour" <${process.env.EMAIL_USER}>`,
//       to: adminTo,
//       subject: `🚨 New ${serviceType} Request - ${name}`,
//       html: adminHtml
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("sendServiceEmail error:", error);
//     return { success: false, error: error.message || String(error) };
//   }
// }

async function sendServiceEmail(payload, serviceType) {
  try {
    const transporter = createTransporter();

    const user = payload.email;
    const name = payload.name || "Customer";
    const adminTo = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    // Compose a simple subject per service
    const subject = `Thanks for your ${serviceType} request - Jaipur-Thailand Tour`;

    // Build HTML summary of submitted data with better styling
    const rows = Object.keys(payload)
      .filter(k => k !== 'serviceType')
      .map(k => {
        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        const value = payload[k] || 'Not provided';
        return `
          <tr>
            <td style="padding:12px 16px; background:#f8fafc; border:1px solid #e2e8f0; font-weight:600; color:#475569; width:30%; word-break:break-word;">${label}</td>
            <td style="padding:12px 16px; border:1px solid #e2e8f0; color:#334155; width:70%; word-break:break-word;">${value}</td>
          </tr>
        `;
      })
      .join("");

    const userHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You - Jaipur-Thailand Tour</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container {
              padding: 20px !important;
            }
            .content {
              padding: 20px !important;
            }
            table {
              width: 100% !important;
            }
            td {
              display: block !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }
            tr {
              display: block !important;
              margin-bottom: 16px !important;
              border: 1px solid #e2e8f0 !important;
              border-radius: 8px !important;
              overflow: hidden !important;
            }
            .mobile-label {
              font-weight: 600 !important;
              background: #f8fafc !important;
              padding: 12px 16px !important;
              border-bottom: 1px solid #e2e8f0 !important;
            }
            .mobile-value {
              padding: 12px 16px !important;
              background: white !important;
            }
            .contact-info p {
              display: block !important;
              margin: 8px 0 !important;
            }
          }
        </style>
      </head>
      <body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        ${emailHeader}
        <div class="container" style="max-width:600px; margin:0 auto; background:white;">
          <div class="content" style="padding:40px;">
            <!-- Thank You Section -->
            <div style="text-align:center; margin-bottom:30px;">
              <h2 style="color:#1e293b; margin:0 0 12px 0; font-size:24px; font-weight:600;">Thank You, ${name}!</h2>
              <p style="color:#64748b; margin:0; font-size:16px; line-height:1.6;">
                We've received your <strong style="color:#1e40af;">${serviceType}</strong> request and our team is already working on it.
              </p>
            </div>

            <!-- Request Details -->
            <div style="background:#f8fafc; border-radius:12px; padding:24px; margin:30px 0;">
              <h3 style="color:#1e293b; margin:0 0 20px 0; font-size:18px; font-weight:600; display:flex; align-items:center; justify-content:center;">
                <span style="background:#3b82f6; color:white; width:24px; height:24px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; margin-right:12px; font-size:14px;">📋</span>
                Request Details
              </h3>
              
              <!-- Desktop Table -->
              <table style="width:100%; border-collapse:collapse; border-radius:8px; overflow:hidden; display:table;" class="desktop-table">
                ${rows}
              </table>
              
              <!-- Mobile Table -->
              <div style="display:none;" class="mobile-table">
                ${Object.keys(payload)
                  .filter(k => k !== 'serviceType')
                  .map(k => {
                    const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const value = payload[k] || 'Not provided';
                    return `
                      <div style="margin-bottom:16px; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
                        <div class="mobile-label" style="font-weight:600; color:#475569; background:#f8fafc; padding:12px 16px; border-bottom:1px solid #e2e8f0;">${label}</div>
                        <div class="mobile-value" style="color:#334155; padding:12px 16px; background:white; word-break:break-word;">${value}</div>
                      </div>
                    `;
                  })
                  .join("")}
              </div>
            </div>

            <!-- Next Steps -->
            <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; padding:24px; margin:30px 0;">
              <h3 style="color:#0c4a6e; margin:0 0 16px 0; font-size:18px; font-weight:600; text-align:center;">What Happens Next?</h3>
              <ul style="color:#0369a1; margin:0; padding-left:20px; line-height:1.6;">
                <li style="margin-bottom:8px;">Our travel expert will contact you within <strong>24 hours</strong></li>
                <li style="margin-bottom:8px;">We'll provide the best available options and prices</li>
                <li>Get ready for an amazing travel experience!</li>
              </ul>
            </div>

            <!-- Contact Info -->
            <div style="text-align:center; padding:24px; background:#f1f5f9; border-radius:12px;">
              <h4 style="color:#475569; margin:0 0 16px 0; font-size:16px; font-weight:600;">Need Immediate Assistance?</h4>
              <div class="contact-info">
                <p style="color:#64748b; margin:8px 0; display:block;">
                  📞 ${process.env.CONTACT_PHONE || '+91 9352056337'}
                </p>
                <p style="color:#64748b; margin:8px 0; display:block;">
                  ✉️ ${process.env.CONTACT_EMAIL || 'codermat@gmail.com'}
                </p>
              </div>
            </div>
          </div>
        </div>
        ${emailFooter}
        <script>
          // Show mobile table on small screens, hide desktop table
          if (window.innerWidth <= 600) {
            document.querySelector('.desktop-table').style.display = 'none';
            document.querySelector('.mobile-table').style.display = 'block';
          }
        </script>
      </body>
      </html>
    `;

    const adminHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Request - Jaipur-Thailand Tour</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container {
              padding: 20px !important;
            }
            .content {
              padding: 20px !important;
            }
            table {
              width: 100% !important;
            }
            td {
              display: block !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }
            tr {
              display: block !important;
              margin-bottom: 16px !important;
              border: 1px solid #e2e8f0 !important;
              border-radius: 8px !important;
              overflow: hidden !important;
            }
            .mobile-label {
              font-weight: 600 !important;
              background: #fef2f2 !important;
              padding: 12px 16px !important;
              border-bottom: 1px solid #fecaca !important;
              color: #dc2626 !important;
            }
            .mobile-value {
              padding: 12px 16px !important;
              background: white !important;
            }
          }
        </style>
      </head>
      <body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        ${emailHeader}
        <div class="container" style="max-width:600px; margin:0 auto; background:white;">
          <div class="content" style="padding:40px;">
            <!-- Alert Header -->
            <div style="text-align:center; margin-bottom:30px;">
              <h2 style="color:#1e293b; margin:0 0 12px 0; font-size:24px; font-weight:600;">New ${serviceType} Request</h2>
              <p style="color:#64748b; margin:0; font-size:16px;">
                Received from <strong>${name}</strong> (${payload.email})
              </p>
            </div>

            <!-- Customer Details -->
            <div style="background:#fef2f2; border-radius:12px; padding:24px; margin:30px 0;">
              <h3 style="color:#dc2626; margin:0 0 20px 0; font-size:18px; font-weight:600; display:flex; align-items:center; justify-content:center;">
                <span style="background:#dc2626; color:white; width:24px; height:24px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; margin-right:12px; font-size:14px;">👤</span>
                Customer Information
              </h3>
              
              <!-- Desktop Table -->
              <table style="width:100%; border-collapse:collapse; border-radius:8px; overflow:hidden; display:table;" class="desktop-table">
                ${rows}
              </table>
              
              <!-- Mobile Table -->
              <div style="display:none;" class="mobile-table">
                ${Object.keys(payload)
                  .filter(k => k !== 'serviceType')
                  .map(k => {
                    const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const value = payload[k] || 'Not provided';
                    return `
                      <div style="margin-bottom:16px; border:1px solid #fecaca; border-radius:8px; overflow:hidden;">
                        <div class="mobile-label" style="font-weight:600; color:#dc2626; background:#fef2f2; padding:12px 16px; border-bottom:1px solid #fecaca;">${label}</div>
                        <div class="mobile-value" style="color:#334155; padding:12px 16px; background:white; word-break:break-word;">${value}</div>
                      </div>
                    `;
                  })
                  .join("")}
              </div>
            </div>

            <!-- Action Required -->
            <div style="background:#fffbeb; border:1px solid #fcd34d; border-radius:12px; padding:24px; margin:30px 0;">
              <h3 style="color:#92400e; margin:0 0 16px 0; font-size:18px; font-weight:600; text-align:center;">Action Required</h3>
              <ul style="color:#92400e; margin:0; padding-left:20px; line-height:1.6;">
                <li style="margin-bottom:8px;">Contact customer within <strong>24 hours</strong></li>
                <li style="margin-bottom:8px;">Provide best available options and pricing</li>
                <li>Update CRM with customer response</li>
              </ul>
            </div>

            <!-- Submission Info -->
            <div style="background:#f1f5f9; border-radius:8px; padding:16px; text-align:center;">
              <p style="color:#475569; margin:0; font-size:14px;">
                <strong>Submitted:</strong> ${new Date().toLocaleString('en-IN', { 
                  timeZone: 'Asia/Kolkata',
                  dateStyle: 'full', 
                  timeStyle: 'long' 
                })}
              </p>
            </div>
          </div>
        </div>
        ${emailFooter}
        <script>
          // Show mobile table on small screens, hide desktop table
          if (window.innerWidth <= 600) {
            document.querySelector('.desktop-table').style.display = 'none';
            document.querySelector('.mobile-table').style.display = 'block';
          }
        </script>
      </body>
      </html>
    `;

    // Send user email
    await transporter.sendMail({
      from: `"Jaipur-Thailand Tour" <${process.env.EMAIL_USER}>`,
      to: user,
      subject,
      html: userHtml
    });

    // Send admin email
    await transporter.sendMail({
      from: `"Jaipur-Thailand Tour" <${process.env.EMAIL_USER}>`,
      to: adminTo,
      subject: `🚨 New ${serviceType} Request - ${name}`,
      html: adminHtml
    });

    return { success: true };
  } catch (error) {
    console.error("sendServiceEmail error:", error);
    return { success: false, error: error.message || String(error) };
  }
}

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendResetPasswordEmail,
  sendContactEmail,
  sendBookingEmail,
  sendServiceEmail
};





