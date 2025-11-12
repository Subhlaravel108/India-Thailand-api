const userRoutes = async (fastify, options) => {
  // Get all users (except admin) + search + pagination
  fastify.get("/users", async (request, reply) => {
    try {
      const db = request.server.mongo.db;
      const usersCollection = db.collection("Users");

      // Query params: search, page, limit
      const { search, page = 1, limit = 10 } = request.query;

      // Convert page & limit to number
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      // Filter object (exclude admin)
      const filter = { role: { $ne: "admin" } };

      // Search filter (optional)
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }

      // Get total count for pagination
      const totalUsers = await usersCollection.countDocuments(filter);

      // Fetch users with pagination
      const users = await usersCollection
        .find(filter, { projection: { password: 0, otp: 0 } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .toArray();

      // Return paginated response
      return reply.status(200).send({
        success: true,
        data: users,
        pagination: {
          total: totalUsers,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalUsers / limitNumber),
        },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      reply.status(500).send({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  });
};

module.exports = userRoutes;
