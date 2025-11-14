// controllers/service.controller.js
const { validateServicePayload, formatYupErrors } = require("../validators/service.validator");
const { sendServiceEmail } = require("../utils/email");

exports.submitService = async (req, reply) => {
  try {
    const body = req.body || {};
    const { serviceType } = body;

    // validate presence of serviceType
    if (!serviceType) {
      return reply.code(400).send({ success: false, message: "serviceType is required" });
    }

    // Validate payload depending on serviceType
    try {
      await validateServicePayload(serviceType, body);
    } catch (yupError) {
      const errors = formatYupErrors(yupError);
      return reply.code(400).send({ success: false, errors });
    }

    // DB
    const db = req.server?.mongo?.db || req.mongo?.db;
    if (!db) {
      return reply.code(500).send({ success: false, message: "Database not available" });
    }

    const servicesCol = db.collection("services");

    const saved = {
      serviceType,
      data: { ...body },
    //   ip: req.ip || req.raw?.socket?.remoteAddress || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await servicesCol.insertOne(saved);

    // Send emails (user + admin). email util returns { success, error? }
    const emailResult = await sendServiceEmail(body, serviceType);

    if (!emailResult.success) {
      // we still return success for DB insert but inform about email failure
      return reply.code(201).send({
        success: true,
        message: "Submitted successfully but failed to send email. Data saved.",
        emailError: emailResult.error,
        id: insertResult.insertedId
      });
    }

    return reply.code(201).send({
      success: true,
      message: "Submitted successfully. Confirmation email sent.",
      id: insertResult.insertedId
    });

  } catch (error) {
    console.error("Service submit error:", error);
    return reply.code(500).send({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
