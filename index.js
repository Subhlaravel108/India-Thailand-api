const fastify = require('fastify')({ logger: true });
require('dotenv').config();

const { MONGODB_URI } = require('./config/database');

// Register Fastify plugins
fastify.register(require('@fastify/cors'), {
  origin: true, // allow all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ✅ required for update/delete
  allowedHeaders: ["Content-Type", "Authorization"], // ✅ recommended
});


fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET
});

fastify.register(require('@fastify/formbody')); // For form-data
fastify.register(require('@fastify/multipart')); // For multipart/form-data

// Register MongoDB plugin
fastify.register(require('@fastify/mongodb'), {
  url: MONGODB_URI
});

// Health check route
fastify.get('/', async (request, reply) => {
  return { 
    message: 'Fastify Server is running with MongoDB!', 
    status: 'OK',
    timestamp: new Date().toISOString()
  };
});

// Register routes with prefix for API versioning
fastify.register(require('./routes/auth.routes'), { prefix: '/api/auth' });
fastify.register(require('./routes/user.routes'), { prefix: '/api' });

// // Backward compatibility - old routes without prefix
// fastify.register(require('./routes/auth.routes'), { prefix: '' });

fastify.register(require('./routes/upload.routes'), { prefix: '/api' });

fastify.register(require('./routes/package.routes'), { prefix: '/api' });
fastify.register(require('./routes/tourRoutes'), { prefix: '/api' });

fastify.register(require('./routes/blog.routes'), { prefix: '/api' });

fastify.register(require('./routes/blogCategory.route'), { prefix: '/api' });

fastify.register(require('./routes/destination.routes'), { prefix: '/api' });

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('🚀 Server is running on http://localhost:3000');
    console.log('📝 API Routes:');
    console.log('   - POST /api/auth/register');
    console.log('   - POST /api/auth/verify-otp');
    console.log('   - POST /api/auth/resend-otp');
    console.log('   - POST /api/auth/login');
    console.log('   - POST /api/auth/forgot-password');
    console.log('   - POST /api/auth/verify-reset-otp');
    console.log('   - POST /api/auth/reset-password');
    console.log('   - GET  /api/users');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();