const {getOverviewCounts,getUserGraphStats,getBookingsLast30Days}=require("../controllers/dashboard.controller")
// const {getOverviewValidator}=require("../validators/dashboard.validator")
const authMiddleware = require("../middleware/auth.middleware");


async function dashBoardRoute(fastify) {
    //  fastify.post("/dashboard/overview", Contact);
     fastify.get("/dashboard/overview",{preHandler:authMiddleware},getOverviewCounts)
     fastify.get("/dashboard/users-graph",{preHandler:authMiddleware},getUserGraphStats)
     fastify.get("/dashboard/bookings-graph",{preHandler:authMiddleware},getBookingsLast30Days)
}

module.exports =dashBoardRoute