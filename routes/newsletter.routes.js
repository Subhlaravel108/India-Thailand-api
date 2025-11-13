// routes/newsletter.routes.js
const { subscribe, list } = require("../controllers/newsletterController");

async function newsletterRoutes(fastify) {
  fastify.post("/newsletter/subscribe", subscribe);

  // admin/listing endpoint (you can protect this route with auth middleware if needed)
  fastify.get("/newsletter", list);
}

module.exports = newsletterRoutes;
