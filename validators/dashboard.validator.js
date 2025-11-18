const yup = require("yup");

// 🟢 No input required → Still returning a structure for consistency
export const getOverviewValidator = {
  schema: {
    body: yup.object().shape({}),      // no inputs needed
    params: yup.object().shape({}),    // no params
    query: yup.object().shape({}),     // no query
  },

  // OpenAPI / Fastify schema
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "object",
          properties: {
            totalUsers: { type: "number" },
            totalBlogs: { type: "number" },
            activeTours: { type: "number" },
            totalDestinations: { type: "number" },
          },
        },
      },
    },
  },
};
