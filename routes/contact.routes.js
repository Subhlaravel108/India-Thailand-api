const {Contact,getAllContacts}=require("../controllers/contact")

const authMiddleware = require("../middleware/auth.middleware");

async function ContactRoute(fastify) {
     fastify.post("/contact", Contact);
     fastify.get("/contacts-list",{preHandler:authMiddleware},getAllContacts)
}

module.exports =ContactRoute