// middlewares/adminOnly.js
 const adminOnly = async (request, reply) => {
  if (!request.user || request.user.role !== 'admin') {
    return reply.status(403).send({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
};

module.exports = adminOnly;