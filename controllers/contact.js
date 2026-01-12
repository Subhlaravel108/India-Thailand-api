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

    const db = req.mongo?.db || req.server?.mongo?.db;
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
      source: "contact",
      status:"New",
      assignedCC: null,
      message: body.message.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await contactCol.insertOne(contactData);
    console.log("📩 New contact submitted:", contactData.email);

    // let emailResult = { success: false };
    // try {
    //   emailResult = await sendContactEmail(body);
    // } catch (emailErr) {
    //   console.error("❌ Email sending exception:", emailErr);
    // }

    const emailResult=await  sendContactEmail(body)

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


exports.getAllContacts = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const contactsCol = db.collection("contact"); // plural name rakho consistency ke liye

    // 🔹 Query parameters (defaults)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search ? req.query.search.trim() : "";

    // 🔹 Build search filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        {lastname:{ $regex: search, $options: "i" }},
        { number: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // 🔹 Count total documents (for pagination)
    const totalContacts = await contactsCol.countDocuments(filter);

    // 🔹 Fetch contacts with pagination
    const contacts = await contactsCol
      .find(filter)
      .sort({ createdAt: -1 }) // latest first
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // 🔹 Pagination info
    const totalPages = Math.ceil(totalContacts / limit);

    return reply.code(200).send({
      success: true,
      message: "Contacts fetched successfully",
      pagination: {
        total: totalContacts,
        page,
        limit,
        totalPages,
      },
      data: contacts,
    });
  } catch (err) {
    console.error("Get All Contacts Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
