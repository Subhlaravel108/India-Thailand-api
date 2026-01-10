const {AllInquiries,assignInquiry, updateInquiryStatus} = require('../controllers/allInquiries.controller');
const authMiddleware = require("../middleware/auth.middleware");
const ccOnly = require('../middleware/ccOnly');
async function allInquiriesRoutes(fastify) {
    
  fastify.get('/all-inquiries',{preHandler:authMiddleware},AllInquiries);
  fastify.patch('/cc/assign/:id',{preHandler:[authMiddleware,ccOnly]},assignInquiry);
  fastify.patch('/cc/update-status/:id',{preHandler:[authMiddleware,ccOnly]},updateInquiryStatus);
}
module.exports = allInquiriesRoutes;