const userRoutes = async (fastify, options) => {
  // Get all users (except admin) + search functionality
  fastify.get('/users', async (request, reply) => {
    try {
      const db = request.server.mongo.db;
      const usersCollection = db.collection('Users');

      // Query params se search keyword lo
      const { search } = request.query;

      // Filter object initialize karo
      const filter = {
        role: { $ne: 'admin' } // admin role ko exclude karega
      };

      // Agar search query di gayi hai to name/email/phone pe search karega
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },   // name match
          { email: { $regex: search, $options: 'i' } },  // email match
          { phone: { $regex: search, $options: 'i' } }   // phone match
        ];
      }

      // Mongo query execute karo
      const users = await usersCollection
        .find(filter, { projection: { password: 0, otp: 0 } })
        .sort({ createdAt: -1 }) // latest users first
        .toArray();

      return reply.status(200).send({
        success: true,
        data: users
      });

    } catch (error) {
      console.error('Error fetching users:', error);
      reply.status(500).send({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  });
};

module.exports = userRoutes;
