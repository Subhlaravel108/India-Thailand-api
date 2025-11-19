const { changeUserStatus } = require("../controllers/auth.controller");
const {createFeedback,getAllFeedback,ChangeFeedbackStatus,getAllApprovedFeedback}=require("../controllers/feddback.controller")
const authMiddleware = require("../middleware/auth.middleware");
async function feedbackRoute(fastify) {
    fastify.post("/feedback",createFeedback)
    fastify.get("/feedback-list", { preHandler: authMiddleware },getAllFeedback)
    fastify.get("/feedback-lists",getAllApprovedFeedback)
    fastify.post("/feedback/status/:id", { preHandler: authMiddleware },ChangeFeedbackStatus)
}

module.exports=feedbackRoute