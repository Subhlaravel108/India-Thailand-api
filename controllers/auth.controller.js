const bcrypt = require('bcryptjs');
const { parseRequest } = require('../utils/requestParser');
const { validateRegister } = require('../utils/validators');
const { generateOTP, sendOTPEmail,sendResetPasswordEmail } = require('../utils/email');
const { mongodb } = require('@fastify/mongodb');
const { ObjectId } = require('@fastify/mongodb');
// Register user
const register = async (request, reply) => {
  try {
    const body = await parseRequest(request);
    const { name, email, password, phone } = body;

    // Validate input
    const validation = validateRegister({ name, email, password, phone });
    
    if (!validation.isValid) {
      return reply.status(400).send({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Get MongoDB from fastify instance
    const db = request.server.mongo.db;

    // Check if user exists
    const existingUser = await db.collection('Users').findOne({ email });
    
    if (existingUser) {
      return reply.status(400).send({
        success: false,
        message: 'User already exists with this email',
        errors: {
          email: 'This email is already registered'
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate and send OTP
    const otp = generateOTP();
    const emailResult = await sendOTPEmail(email, otp);
    
    // Log OTP for development/testing
    console.log(`🔑 OTP for ${email}: ${otp}`);
    
    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
    }

    // Create user
    const user = {
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'user',
      otp: otp,
      status:"Active",
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('Users').insertOne(user);

    return reply.status(201).send({
      success: true,
      message: 'User registered successfully. Please check your email for OTP.',
      data: {
        id: result.insertedId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailSent: emailResult.success,
        status:user.status
      }
    });

  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Verify OTP
const verifyOTP = async (request, reply) => {
  try {
    const body = await parseRequest(request);
    const { email, otp } = body;

    if (!email || !otp) {
      return reply.status(400).send({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const db = request.server.mongo.db;
    const user = await db.collection('Users').findOne({ email });

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return reply.status(400).send({
        success: false,
        message: 'User is already verified'
      });
    }

    if (user.otp !== otp) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return reply.status(400).send({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Update user as verified
    await db.collection('Users').updateOne(
      { email },
      {
        $set: {
          isVerified: true,
          otp: null,
          otpExpiresAt: null,
          updatedAt: new Date()
        }
      }
    );

    return reply.status(200).send({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Resend OTP
const resendOTP = async (request, reply) => {
  try {
    const body = await parseRequest(request);
    const { email } = body;

    if (!email) {
      return reply.status(400).send({
        success: false,
        message: 'Email is required'
      });
    }

    const db = request.server.mongo.db;
    const user = await db.collection('Users').findOne({ email });

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return reply.status(400).send({
        success: false,
        message: 'User is already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const emailResult = await sendResetPasswordEmail(email, otp);
    
    if (!emailResult.success) {
      return reply.status(500).send({
        success: false,
        message: 'Failed to send OTP email',
        error: emailResult.error
      });
    }

    // Update OTP in database
    await db.collection('Users').updateOne(
      { email },
      {
        $set: {
          otp: otp,
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
          updatedAt: new Date()
        }
      }
    );

    return reply.status(200).send({
      success: true,
      message: 'OTP has been resent to your email'
    });

  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const login = async (request, reply) => {
  try {
    const body = await parseRequest(request);
    const { email, password } = body;

    if (!email || !password) {
      return reply.code(400).send({
        success: false,
        message: "Email and password are required"
      });
    }

    const db = request.server.mongo.db;
    const user = await db.collection("Users").findOne({ email });

    if (!user) {
      return reply.code(401).send({
        success: false,
        message: "Invalid credentials"
      });
    }

    if (!user.isVerified) {
      return reply.code(401).send({
        success: false,
        message: "Please verify your email first"
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return reply.code(401).send({
        success: false,
        message: "Invalid credentials"
      });
    }

    // ✅ Create JWT Token
    const token = request.server.jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      { expiresIn: "7d" } // Token validity
    );

    return reply.code(200).send({
      success: true,
      message: "Login successful ✅",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: token
      }
    });

  } catch (error) {
    return reply.code(500).send({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Forgot Password - Send OTP
const forgotPassword = async (request, reply) => {
  try {
    const body = await parseRequest(request);
    const { email } = body;

    if (!email) {
      return reply.status(400).send({
        success: false,
        message: 'Email is required'
      });
    }

    const db = request.server.mongo.db;
    const user = await db.collection('Users').findOne({ email });

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset OTP
    const resetOTP = generateOTP();
    const resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with reset OTP
    await db.collection('Users').updateOne(
      { email },
      {
        $set: {
          resetOTP: resetOTP,
          resetExpiresAt: resetExpiresAt,
          updatedAt: new Date()
        }
      }
    );

    // Send reset email
    const emailResult = await sendResetPasswordEmail(email, resetOTP);
    
    console.log(`🔑 Reset OTP for ${email}: ${resetOTP}`);

    return reply.status(200).send({
      success: true,
      message: 'Password reset OTP sent to your email',
      emailSent: emailResult.success
    });

  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Verify Reset OTP (Frontend compatible)
const verifyResetOTP = async (request, reply) => {
  try {
    const body = await parseRequest(request);
    const { email, otp } = body;

    if (!email || !otp) {
      return reply.status(400).send({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const db = request.server.mongo.db;
    const user = await db.collection('Users').findOne({ email });

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    // Check reset OTP
    if (user.resetOTP !== otp) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid reset OTP'
      });
    }

    // Check if OTP expired
    if (new Date() > new Date(user.resetExpiresAt)) {
      return reply.status(400).send({
        success: false,
        message: 'Reset OTP has expired'
      });
    }

    // Mark OTP as verified (don't clear it yet, frontend will use it for password reset)
    await db.collection('Users').updateOne(
      { email },
      {
        $set: {
          resetOTPVerified: true,
          updatedAt: new Date()
        }
      }
    );

    return reply.status(200).send({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.'
    });

  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Reset Password
const resetPassword = async (request, reply) => {
  try {
    const body = await parseRequest(request);
    const { email, otp, password, password_confirmation } = body;

    if (!email || !otp || !password || !password_confirmation) {
      return reply.status(400).send({
        success: false,
        message: 'Email, OTP, password, and password confirmation are required'
      });
    }

    // Password validation
    if (password.length < 6) {
      return reply.status(400).send({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Password confirmation validation
    if (password !== password_confirmation) {
      return reply.status(400).send({
        success: false,
        message: 'Password and password confirmation do not match'
      });
    }

    const db = request.server.mongo.db;
    const user = await db.collection('Users').findOne({ email });

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP is verified
    if (!user.resetOTPVerified) {
      return reply.status(400).send({
        success: false,
        message: 'Please verify OTP first'
      });
    }

    // Check reset OTP again for security
    if (user.resetOTP !== otp) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP expired
    if (new Date() > new Date(user.resetExpiresAt)) {
      return reply.status(400).send({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear all reset fields
    await db.collection('Users').updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          resetOTP: null,
          resetExpiresAt: null,
          resetOTPVerified: null,
          updatedAt: new Date()
        }
      }
    );

    return reply.status(200).send({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const changeUserStatus = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database not connected",
      });
    }

    const usersCol = db.collection("Users");
    const { id } = req.params;
    const body = req.body || {};

    // // ✅ Validate input
    // try {
    //   await userStatusSchema.validate(body, { abortEarly: false });
    // } catch (validationError) {
    //   return reply.code(400).send({
    //     success: false,
    //     message: "Validation Failed",
    //     errors: validationError,
    //   });
    // }

    // ✅ Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid user ID",
      });
    }

    // ✅ Update user status
    const result = await usersCol.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: body.status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return reply.code(404).send({
        success: false,
        message: "User not found",
      });
    }

    return reply.send({
      success: true,
      message: `User status updated to ${body.status}`,
    });
  } catch (err) {
    console.error("Change User Status Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  changeUserStatus
};