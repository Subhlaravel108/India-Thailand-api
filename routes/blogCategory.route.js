const {createBlogCategory,updateBlogCategory,getAllBlogCategory,getBlogCategoryDetails,deleteBlogCategory}=require("../controllers/BlogCategory.controller");

const authMiddleware = require("../middleware/auth.middleware");

async function blogCategoryRoutes(fastify) {
  // Create blog category (admin only). Remove preHandler if public.
  fastify.post("/blog-category", { preHandler: authMiddleware }, createBlogCategory);
  fastify.put("/blog-category/:slug", { preHandler: authMiddleware }, updateBlogCategory);
  fastify.get("/blog-categories", { preHandler: authMiddleware }, getAllBlogCategory);
  fastify.get("/blog-category/:slug", { preHandler: authMiddleware }, getBlogCategoryDetails);
  fastify.delete("/blog-category/:id", { preHandler: authMiddleware }, deleteBlogCategory);
}

module.exports = blogCategoryRoutes;