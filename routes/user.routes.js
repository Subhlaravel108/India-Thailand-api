const authMiddleware = require("../middleware/auth.middleware");

const userRoutes = async (fastify, options) => {
  // ✅ Get all users (except admin) + search + pagination (Protected route)
  fastify.get("/users", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const db = request.server.mongo.db;
      const usersCollection = db.collection("Users");

      // Query params
      const { search, page = 1, limit = 10 } = request.query;

      // Convert page & limit to number
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      // Base filter (exclude admin)
      const filter = { role: { $ne: "admin" } };

      // Optional search
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }

      // Total count for pagination
      const totalUsers = await usersCollection.countDocuments(filter);

      // Fetch paginated users
      const users = await usersCollection
        .find(filter, { projection: { password: 0, otp: 0 } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .toArray();

      // Response
      return reply.status(200).send({
        success: true,
        message: "Users fetched successfully",
        data: users,
        pagination: {
          total: totalUsers,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalUsers / limitNumber),
        },
      });
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      reply.status(500).send({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  });
};

module.exports = userRoutes;
