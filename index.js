const fastify = require('fastify')({ logger: false });
require('dotenv').config();

const { MONGODB_URI } = require('./config/database');

// Register Fastify plugins
fastify.register(require('@fastify/cors'), {
  origin: '*',
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET
});

fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/multipart'));

// Register MongoDB plugin
fastify.register(require('@fastify/mongodb'), {
  url: MONGODB_URI
});

// Basic route
fastify.get('/', async () => {
  return {
    message: '✅ Fastify API running on Vercel!',
    env: process.env.NODE_ENV || 'unknown',
    time: new Date().toISOString()
  };
});

// Register all your routes
fastify.register(require('./routes/auth.routes'), { prefix: '/api/auth' });
fastify.register(require('./routes/user.routes'), { prefix: '/api' });
fastify.register(require('./routes/upload.routes'), { prefix: '/api' });
fastify.register(require('./routes/package.routes'), { prefix: '/api' });
fastify.register(require('./routes/tourRoutes'), { prefix: '/api' });
fastify.register(require('./routes/blog.routes'), { prefix: '/api' });
fastify.register(require('./routes/blogCategory.route'), { prefix: '/api' });
fastify.register(require('./routes/destination.routes'), { prefix: '/api' });

// ✅ Instead of listen(), export as serverless handler for Vercel
module.exports = async (req, res) => {
  await fastify.ready();
  fastify.server.emit('request', req, res);
};
