// routes/service.route.js
const { submitService } = require("../controllers/service.controller");

async function serviceRoute(fastify, opts) {
  fastify.post("/service", submitService);
}

module.exports = serviceRoute;
