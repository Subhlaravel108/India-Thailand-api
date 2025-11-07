const { uploadImage } = require("../controllers/upload.controller");

async function uploadRoutes(fastify, options) {
  fastify.post("/upload-image", uploadImage);
}

module.exports = uploadRoutes;
