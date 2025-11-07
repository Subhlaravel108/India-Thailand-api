const {getTours, getToursBySlug,createTour,updateTourBySlug,deleteTourById,getToursByPackageSlug,getFrontTours,getFrontToursBySlug } = require("../controllers/tourController");
const authMiddleware = require("../middleware/auth.middleware");

async function tourRoutes(fastify) {
  // admin api
  fastify.post("/tours", { preHandler: authMiddleware }, createTour);
  fastify.put("/tours/:slug", { preHandler: authMiddleware }, updateTourBySlug);
    fastify.get("/tours/:slug",{preHandler:authMiddleware}, getToursBySlug);
    fastify.get("/tours", { preHandler: authMiddleware }, getTours);
    fastify.delete("/tours/:id", { preHandler: authMiddleware }, deleteTourById);

  // front api
    fastify.get("/front/tours/by-package/:slug",getToursByPackageSlug)
      fastify.get("/front/tours/:slug", getFrontToursBySlug);
    fastify.get("/front/tours", getFrontTours);

}

module.exports = tourRoutes;
