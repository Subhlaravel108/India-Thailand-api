const authMiddleware=require("../middleware/auth.middleware")
const { Booking,getAllBookings } = require("../controllers/booking");

async function BookingRoute(fastify) {
  fastify.post("/booking", Booking);
  fastify.get("/bookings-list",{preHandler:authMiddleware},getAllBookings)
}

module.exports = BookingRoute;
