const { status } = require("nprogress");
const { createFeedbackSchema } = require("../validators/feedback.validator");
const { ObjectId } = require('@fastify/mongodb');

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

exports.createFeedback = async (req, reply) => {
    try {
        const body = req.body;

        try {
            await createFeedbackSchema.validate(body, { abortEarly: false });
        } catch (validationError) {
            return reply.code(400).send({
                success: false,
                message: "Validation Failed",
                errors: formatYupErrors(validationError),
            });
        }

        const db = req.mongo?.db || req.server?.mongo?.db;
        if (!db) {
            return reply.code(500).send({
                success: false,
                message: "Database connection not available",
            });
        }

        const feedbacksCol = db.collection("feedbacks");

        const dataToInsert = {
            ...body,
            status: "pending", 
            createdAt: new Date(),
            updatedAt: new Date(),
        };

       
        const result = await feedbacksCol.insertOne(dataToInsert);

        return reply.code(201).send({
            success: true,
            message: "Feedback submitted successfully",
            data: {
                id: result.insertedId,
            },
        });

    } catch (error) {
        console.error("Feedback Error:", error);

        return reply.code(500).send({
            success: false,
            message: "Internal Server Error",
        });
    }
};


exports.getAllFeedback = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server.mongo.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const feedbackCol = db.collection("feedbacks");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search ? req.query.search.trim() : "";
    const download = req.query.download === "true";

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { number: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // 🚀 DOWNLOAD MODE — only approved, no pagination
    if (download) {
      const downloadFilter = {
        ...filter,
        status: "approved",
      };

      const approvedFeedbacks = await feedbackCol
        .find(downloadFilter)
        .sort({ createdAt: -1 })   // no skip/limit here ❌
        .toArray();

      const jsonData = JSON.stringify({
          success: true,
          total: approvedFeedbacks.length,
          data: approvedFeedbacks,
        },null,2);

      return reply
        .header("Content-Type", "application/json")
        .header("Content-Disposition", "attachment; filename=approved_feedbacks.json")
        .send(jsonData);
    }

    // NORMAL RESPONSE — with pagination
    const totalFeedbacks = await feedbackCol.countDocuments(filter);

    const feedbacks = await feedbackCol
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const totalPages = Math.ceil(totalFeedbacks / limit);

    return reply.code(200).send({
      success: true,
      message: "Feedbacks fetched successfully",
      pagination: {
        total: totalFeedbacks,
        page,
        limit,
        totalPages,
      },
      data: feedbacks,
    });

  } catch (err) {
    console.error("Get All Feedbacks Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};



exports.ChangeFeedbackStatus = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database not connected",
      });
    }

    const feedbacksCol = db.collection("feedbacks");
    const { id } = req.params;
    const body = req.body || {};


    // ✅ Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid feedback ID",
      });
    }

    // ✅ Update user status
    const result = await feedbacksCol.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: body.status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return reply.code(404).send({
        success: false,
        message: "feedback not found",
      });
    }

    return reply.send({
      success: true,
      message: `Feedback status updated to ${body.status}`,
    });
  } catch (err) {
    console.error("Change feedback Status Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
}


exports.getAllApprovedFeedback = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server.mongo.db;

    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const feedbackCol = await db.collection("feedbacks");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search ? req.query.search.trim() : "";

    // Base filter = only approved items
    const filter = { status: "approved" };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { number: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const totalFeedbacks = await feedbackCol.countDocuments(filter);

    const feedbacks = await feedbackCol
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const totalPages = Math.ceil(totalFeedbacks / limit);

    return reply.code(200).send({
      success: true,
      message: "Approved feedbacks fetched successfully",
      pagination: {
        total: totalFeedbacks,
        page,
        limit,
        totalPages,
      },
      data: feedbacks,
    });
  } catch (err) {
    console.error("Get All Feedbacks Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
