const authController = require('../controllers/auth.controller');
const authMiddleware = require("../middleware/auth.middleware");
const  adminOnly  = require("../middleware/adminOnly");
const authRoutes = async (fastify, options) => {
 

  // Register
  fastify.post('/register', authController.register);

  fastify.post("/admin/create-cc-user", { preHandler: [authMiddleware, adminOnly]}, authController.createCCUser);
  
  // Verify OTP
  fastify.post('/verify-otp', authController.verifyOTP);
  
  // Resend OTP
  fastify.post('/resend-otp', authController.resendOTP);
  
  // Login
  fastify.post('/login', authController.login);
  
  // Forgot Password
  fastify.post('/forgot-password', authController.forgotPassword);
  
  // Verify Reset OTP (both routes for compatibility)
  fastify.post('/verify-reset-otp', authController.verifyResetOTP);
  // fastify.post('/verify-otp', authController.verifyResetOTP); // Frontend compatibility
  
  // Reset Password
  fastify.post('/reset-password', authController.resetPassword);

  fastify.post("/user/status/:id",authController.changeUserStatus)
  fastify.post("/change-password",{preHandler:authMiddleware},authController.changePassword)
};

module.exports = authRoutes;
