module.exports = async function (fastify) {
  const packageCollection = fastify.mongo.db.collection("packages");

  fastify.decorate("Package", packageCollection);
};
