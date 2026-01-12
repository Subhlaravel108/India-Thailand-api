const {AllInquiries,assignInquiry, updateInquiryStatus,sendCcMessage,getInquiryMessages} = require('../controllers/allInquiries.controller');
const authMiddleware = require("../middleware/auth.middleware");
const ccOnly = require('../middleware/ccOnly');
const adminOnly=require("../middleware/adminOnly")
async function allInquiriesRoutes(fastify) {
    
  fastify.get('/all-inquiries',{preHandler:authMiddleware},AllInquiries);
  fastify.patch('/cc/assign/:id',{preHandler:[authMiddleware,ccOnly]},assignInquiry);
  fastify.patch('/cc/update-status/:id',{preHandler:[authMiddleware,ccOnly]},updateInquiryStatus);
  fastify.post("/cc/message",{preHandler:[authMiddleware,ccOnly]},sendCcMessage);
//   fastify.get(
//   "/admin/inquiry/:id/messages",
//   { preHandler: [authMiddleware, adminOnly] },
//   getInquiryMessagesForAdmin
// );
fastify.get(
  "/inquiry/:id/messages",
  { preHandler: [authMiddleware] },
  getInquiryMessages
);
}
module.exports = allInquiriesRoutes;