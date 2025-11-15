const authMiddleware=require("../middleware/auth.middleware")
const { Booking,getAllBookings,exportBookings } = require("../controllers/booking");

async function BookingRoute(fastify) {
  fastify.post("/booking", Booking);
  fastify.get("/bookings-list",{preHandler:authMiddleware},getAllBookings)
  fastify.get("/bookings/export",{preHandler:authMiddleware},exportBookings)
}

module.exports = BookingRoute;
