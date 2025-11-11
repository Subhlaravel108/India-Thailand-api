const {Contact}=require("../controllers/contact")

// const authMiddleware = require("../middleware/auth.middleware");

async function ContactRoute(fastify) {
     fastify.post("/contact", Contact);
}

module.exports =ContactRoute