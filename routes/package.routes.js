const authMiddleware = require("../middleware/auth.middleware");
const {getPackages , createPackage,updatePackage,deletePackage,getPackageBySlug,getFrontPackages } = require("../controllers/package.controller");

async function packageRoutes(fastify) {
  fastify.get("/package",{preHandler: authMiddleware} ,getPackages);
  fastify.get("/package/detail/:slug",{preHandler:authMiddleware} ,getPackageBySlug);
  fastify.post("/package",{preHandler:authMiddleware}, createPackage);
  fastify.put("/package/:slug",{preHandler:authMiddleware}, updatePackage);
  fastify.delete("/package/:id",{preHandler:authMiddleware}, deletePackage);

  // front api
  fastify.get("/front/package",getFrontPackages)
}

module.exports = packageRoutes;

