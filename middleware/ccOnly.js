// middlewares/ccOnly.js
const ccOnly = (req, reply, done) => {
  if (req.user.role !== "cc_user") {
    return reply.code(403).send({ success: false, message: "Forbidden: Only CC users allowed" });
  }
  done();
};

module.exports = ccOnly;
