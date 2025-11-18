// routes/service.route.js
const { submitService,getAllService } = require("../controllers/service.controller");
const authMiddleware = require("../middleware/auth.middleware");
async function serviceRoute(fastify, opts) {
  fastify.post("/service", submitService);
  fastify.get("/service-list",{preHandler:authMiddleware},getAllService)
}

module.exports = serviceRoute;
