// routes/blog.routes.js
const { createBlog,updateBlogBySlug,getBlogDetailsBySlug,getAllBlogs,deleteBlogById } = require("../controllers/blog.controller");
// if you have auth & admin middlewares:
const authMiddleware = require("../middleware/auth.middleware");

async function blogRoutes(fastify) {
  // Create blog (admin only). Remove preHandler if public.
  fastify.post("/blog", { preHandler:authMiddleware }, createBlog);
 
    // Update blog by slug (admin only). Remove preHandler if public.
    fastify.put("/blog/:slug", { preHandler:authMiddleware }, updateBlogBySlug);
  
    
    fastify.get("/blog/:slug",{preHandler:authMiddleware}, getBlogDetailsBySlug);

    fastify.get("/blog",{preHandler:authMiddleware}, getAllBlogs);

    // Delete blog by ID (admin only). Remove preHandler if public.
    fastify.delete("/blog/:id",{preHandler:authMiddleware}, deleteBlogById);
}

module.exports = blogRoutes;
