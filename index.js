const fastify = require('fastify')({ logger: true });
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
    message: '✅ Fastify Server is running with MongoDb!',
    status: "OK",
    timestamp: new Date().toISOString()
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
fastify.register(require("./routes/contact.routes"),{prefix:'/api'})
fastify.register(require("./routes/bookingRoute"),{prefix:"/api"})
fastify.register(require("./routes/newsletter.routes"), { prefix: "/api" });
fastify.register(require("./routes/service.route"),{prefix:'/api'})
// ✅ Use async start function for stability on Render
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌍 MongoDB URI: ${process.env.MONGODB_URI}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
