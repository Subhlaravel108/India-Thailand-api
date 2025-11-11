const { sendContactEmail } = require('../utils/email');
const { createContactSchema } = require('../validators/contact.validator');

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

exports.Contact = async (req, reply) => {
  try {
    const body = req.body;
    await createContactSchema.validate(body, { abortEarly: false });

    const db = req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const contactCol = db.collection("contact");
    const contactData = {
      name: body.name.trim(),
      lastname: body.lastname.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      travelInterest: body.travelInterest.trim(),
      message: body.message.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await contactCol.insertOne(contactData);
    console.log("📩 New contact submitted:", contactData.email);

    let emailResult = { success: false };
    try {
      emailResult = await sendContactEmail(body);
    } catch (emailErr) {
      console.error("❌ Email sending exception:", emailErr);
    }

    if (!emailResult.success) {
      return reply.code(200).send({
        success: true,
        message:
          "Your message was saved successfully, but we couldn't send the confirmation email right now.",
        contactId: insertResult.insertedId,
      });
    }

    return reply.code(200).send({
      success: true,
      message:
        "Thank you for contacting us. A confirmation email has been sent to your inbox.",
      contactId: insertResult.insertedId,
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      const formattedErrors = formatYupErrors(error);
      return reply.code(400).send({ success: false, errors: formattedErrors });
    }

    console.error("💥 Contact API Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Server error occurred.",
      error: error.message,
    });
  }
};
