const { Booking } = require("../controllers/booking");

async function BookingRoute(fastify) {
  fastify.post("/booking", Booking);
}

module.exports = BookingRoute;
