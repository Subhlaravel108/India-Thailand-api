// controllers/newsletterController.js
const { ObjectId } = require("mongodb");
const { subscribeSchema } = require("../validators/newsletter.validator");

// simple Yup error formatter (if you already have one in project, use that)
const formatYupErrors = (yupError) => {
  const errors = {};
  if (yupError.inner && yupError.inner.length) {
    for (const err of yupError.inner) {
      if (err.path && !errors[err.path]) errors[err.path] = err.message;
    }
  } else if (yupError.path) {
    errors[yupError.path] = yupError.message;
  }
  return errors;
};

exports.subscribe = async (req, reply) => {
  try {
    // Validate request body
    try {
      await subscribeSchema.validate(req.body, { abortEarly: false });
    } catch (validationError) {
      return reply.code(400).send({
        success: false,
        message: "Validation Failed",
        errors: formatYupErrors(validationError),
      });
    }

    const { email } = req.body;

    // DB connection (same pattern used in your project)
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const col = db.collection("newsletters");

    // Prevent duplicate subscription
    const existing = await col.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return reply.code(409).send({
        success: false,
        message: "This email is already subscribed",
      });
    }

    const doc = {
      email: email.toLowerCase().trim(),
      subscribedAt: new Date(),
    };

    const result = await col.insertOne(doc);

    return reply.code(201).send({
      success: true,
      message: "Subscribed successfully",
      data: {
        id: result.insertedId,
        email: doc.email,
        subscribedAt: doc.subscribedAt,
      },
    });
  } catch (err) {
    console.error("Newsletter Subscribe Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

exports.list = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({ success: false, message: "DB not connected" });
    }

    const col = db.collection("newsletters");

    // Pagination + search
    const { page = 1, limit = 10, search = "" } = req.query || {};
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const lim = Math.max(parseInt(limit, 10) || 10, 1);

    const filter = {};
    if (search && typeof search === "string" && search.trim() !== "") {
      filter.email = { $regex: search.trim(), $options: "i" };
    }

    const total = await col.countDocuments(filter);
    const cursor = col
      .find(filter)
      .sort({ subscribedAt: -1 })
      .skip((pageNum - 1) * lim)
      .limit(lim);

    const data = await cursor.toArray();

    return reply.send({
      success: true,
      message: "Newsletter subscribers fetched successfully",
      pagination: {
        total,
        page: pageNum,
        limit: lim,
        totalPages: Math.ceil(total / lim) || 1,
      },
      data,
    });
  } catch (err) {
    console.error("Newsletter List Error:", err);
    return reply.code(500).send({ success: false, message: "Server error", error: err.message });
  }
};
