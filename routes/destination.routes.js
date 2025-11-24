const {createDestination,updateDestination,getAllDestination,getDestinationDetails,deleteDestination,getFrontAllDestination, getFrontDestinationDetails,getToursByDestinationSlug,getAllDestinationByIds} = require("../controllers/destination.controller");
const authMiddleware = require("../middleware/auth.middleware");

async function destinationRoutes(fastify) {
  // Create destination (admin only). Remove preHandler if public.
  fastify.post("/destination", { preHandler: authMiddleware }, createDestination);
  fastify.put("/destination/:slug", { preHandler: authMiddleware }, updateDestination);
  fastify.get("/destinations",{ preHandler: authMiddleware },  getAllDestination);
    fastify.get("/destination/:slug", { preHandler: authMiddleware }, getDestinationDetails);
    fastify.delete("/destination/:id", { preHandler: authMiddleware }, deleteDestination);

    // front api
     fastify.get("/front/destinations", getFrontAllDestination);
     fastify.get("/front/destination/:slug",getFrontDestinationDetails)
     fastify.get(`/front/by-destination/:slug`,getToursByDestinationSlug)
     fastify.post("/front/destinations-by-ids", getAllDestinationByIds);
}


module.exports = destinationRoutes;