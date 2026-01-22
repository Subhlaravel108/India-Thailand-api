const { ObjectId } = require("mongodb");

// const AllInquiries = async (req, reply) => {
//   try {
//     const db = req.mongo?.db || req.server?.mongo?.db;
//     if (!db) {
//       return reply.code(500).send({
//         success: false,
//         message: "Database connection not available"
//       });
//     }

//     const bookingCol = db.collection("bookings");
//     const contactCol = db.collection("contact"); // ensure correct collection name
//     const serviceCol = db.collection("services"); // ensure correct collection name

//     // Query params
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search ? req.query.search.trim() : "";

//     // Build filters for each collection
//     const bookingFilter = search
//       ? { $or: [
//           { fullName: { $regex: search, $options: "i" } },
//           { email: { $regex: search, $options: "i" } },
//           { phone: { $regex: search, $options: "i" } },
//         ]}
//       : {};

//     const contactFilter = search
//       ? { $or: [
//           { name: { $regex: search, $options: "i" } },
//           { email: { $regex: search, $options: "i" } },
//           { phone: { $regex: search, $options: "i" } },
//         ]}
//       : {};

//     const serviceFilter = search
//       ? { $or: [
//           { "data.name": { $regex: search, $options: "i" } },
//           { "data.email": { $regex: search, $options: "i" } },
//           { "data.phone": { $regex: search, $options: "i" } },
//         ]}
//       : {};

//     // Fetch data
//     const bookings = await bookingCol.find(bookingFilter).sort({ createdAt: -1 }).toArray();
//     const contacts = await contactCol.find(contactFilter).sort({ createdAt: -1 }).toArray();
//     const services = await serviceCol.find(serviceFilter).sort({ createdAt: -1 }).toArray();

//     // Normalize each collection
//     const formattedBookings = bookings.map(b => ({
//       _id: b._id,
//       name: b.fullName,
//       email: b.email,
//       phone: b.phone,
//       message: b.message,
//       source: b.source,
//       type: b.packageType,
//       status: b.status,
//       assignedCC: b.assignedCC,
//       createdAt: b.createdAt,
//       updatedAt: b.updatedAt
//     }));

//     const formattedContacts = contacts.map(c => ({
//       _id: c._id,
//       name: c.name,
//       email: c.email,
//       phone: c.phone,
//       message: c.message,
//       source: c.source,
//       type: c.travelInterest || null,
//       status: c.status,
//       assignedCC: c.assignedCC,
//       createdAt: c.createdAt,
//       updatedAt: c.updatedAt
//     }));

//     const formattedServices = services.map(s => ({
//       _id: s._id,
//       name: s.data.name,
//       email: s.data.email,  
//       phone: s.data.phone,
//       message: s.data.message,
//       source: s.source,
//       type: s.serviceType,
//       status: s.status,
//       assignedCC: s.assignedCC,
//       createdAt: s.createdAt,
//       updatedAt: s.updatedAt
//     }));

//     // Merge all
//     let allInquiries = [...formattedBookings, ...formattedContacts, ...formattedServices];

//     // Sort by createdAt descending
//     allInquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//     // Pagination
//     const total = allInquiries.length;
//     const totalPages = Math.ceil(total / limit);
//     const paginatedInquiries = allInquiries.slice((page - 1) * limit, page * limit);

//     return reply.code(200).send({
//       success: true,
//       message: "Inquiries fetched successfully",
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages
//       },
//       data: paginatedInquiries
//     });

//   } catch (err) {
//     console.error("Get All Inquiries Error:", err);
//     return reply.code(500).send({
//       success: false,
//       message: "Internal Server Error",
//       error: err.message
//     });
//   }
// };

const AllInquiries = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available"
      });
    }

    const bookingCol = db.collection("bookings");
    const contactCol = db.collection("contact");
    const serviceCol = db.collection("services");

    // Query params
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search ? req.query.search.trim() : "";
    const serviceType = req.query.serviceType
      ? req.query.serviceType.trim()
      : null;

    const skip = (page - 1) * limit;

    /* ---------------- BOOKING FILTER ---------------- */
    const bookingFilter = {
      ...(search && {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { packageType: { $regex: search, $options: "i" } }
        ]
      }),
      ...(serviceType && { packageType: serviceType })
    };

    /* ---------------- CONTACT FILTER ---------------- */
    const contactFilter = {
      ...(search && {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { travelInterest: { $regex: search, $options: "i" } }
        ]
      }),
      ...(serviceType && { travelInterest: serviceType })
    };

    /* ---------------- SERVICE FILTER ---------------- */
    const serviceFilter = {
      ...(search && {
        $or: [
          { "data.name": { $regex: search, $options: "i" } },
          { "data.email": { $regex: search, $options: "i" } },
          { "data.phone": { $regex: search, $options: "i" } },
          {serviceType: { $regex: search, $options: "i" } }
        ]
      }),
      ...(serviceType && { serviceType })
    };

    /* -------- FETCH MORE DATA TO PAGINATE SAFELY ------ */
    const FETCH_LIMIT = page * limit;

    const [bookings, contacts, services] = await Promise.all([
      bookingCol.find(bookingFilter).sort({ createdAt: -1 }).limit(FETCH_LIMIT).toArray(),
      contactCol.find(contactFilter).sort({ createdAt: -1 }).limit(FETCH_LIMIT).toArray(),
      serviceCol.find(serviceFilter).sort({ createdAt: -1 }).limit(FETCH_LIMIT).toArray()
    ]);

    /* ---------------- NORMALIZE DATA ---------------- */
    const formattedBookings = bookings.map(b => ({
      _id: b._id,
      name: b.fullName,
      email: b.email,
      phone: b.phone,
      message: b.message || null,
      source: "booking",
      type: b.packageType,
      status: b.status || "new",
      assignedCC: b.assignedCC || null,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt
    }));

    const formattedContacts = contacts.map(c => ({
      _id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      message: c.message || null,
      source: "contact",
      type: c.travelInterest || null,
      status: c.status || "new",
      assignedCC: c.assignedCC || null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));

    const formattedServices = services.map(s => ({
      _id: s._id,
      name: s.data?.name,
      email: s.data?.email,
      phone: s.data?.phone,
      message: s.data?.message || null,
      source: "service",
      type: s.serviceType,
      status: s.status || "new",
      assignedCC: s.assignedCC || null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    }));

    /* ---------------- MERGE & SORT ---------------- */
    const allInquiries = [
      ...formattedBookings,
      ...formattedContacts,
      ...formattedServices
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    /* ---------------- FINAL PAGINATION ---------------- */
    const paginatedData = allInquiries.slice(skip, skip + limit);

    const total =
      (await bookingCol.countDocuments(bookingFilter)) +
      (await contactCol.countDocuments(contactFilter)) +
      (await serviceCol.countDocuments(serviceFilter));

    return reply.code(200).send({
      success: true,
      message: "Inquiries fetched successfully",
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: paginatedData
    });

  } catch (err) {
    console.error("AllInquiries Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
};

// module.exports = AllInquiries;

// module.exports = { AllInquiries };


// PATCH /cc/assign/:id


const assignInquiry = async (req, reply) => {
  try {
    const { id } = req.params;
    const { source } = req.body;

    // ✅ JWT payload se CC user id
    if (!req.user || !req.user.id) {
      return reply.code(401).send({
        success: false,
        message: "Unauthorized",
      });
    }

    const ccUserId = new ObjectId(req.user.id);

    const db = req.server.mongo.db;

    const collectionMap = {
      booking: "bookings",
      contact: "contact",
      service: "services",
    };

    if (!collectionMap[source]) {
      return reply.code(400).send({
        success: false,
        message: "Invalid source",
      });
    }

    const col = db.collection(collectionMap[source]);

    const result = await col.updateOne(
      {
        _id: new ObjectId(id),
        assignedCC: null,
      },
      {
        $set: {
          assignedCC: ccUserId,
          status: "In Progress",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return reply.code(400).send({
        success: false,
        message: "Already assigned or inquiry not found",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Inquiry assigned successfully",
    });

  } catch (err) {
    console.error("Assign Inquiry Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};



// PATCH /cc/update-status/:id
const updateInquiryStatus = async (req, reply) => {
  try {
    const { id } = req.params;
    const { source, status } = req.body;

    // ✅ Allowed statuses
    const allowedStatus = ["New", "In Progress", "Closed"];
    if (!allowedStatus.includes(status)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid status value",
      });
    }

    const db = req.server.mongo.db;

    // ✅ Collection mapping
    const collectionMap = {
      booking: "bookings",
      contact: "contact",
      service: "services",
    };

    if (!collectionMap[source]) {
      return reply.code(400).send({
        success: false,
        message: "Invalid source",
      });
    }

    const col = db.collection(collectionMap[source]);

    // 🔐 Base filter
    const filter = {
      _id: new ObjectId(id),
    };

    // 🔐 CC user can update ONLY assigned inquiries
    if (req.user.role === "cc_user") {
      filter.assignedCC = new ObjectId(req.user.id);
    }

    // 🧠 Update logic
    const updateData = {
      status,
      updatedAt: new Date(),
    };

    // ✅ If status moved back to New → unassign CC
    if (status === "New") {
      updateData.assignedCC = null;
    }

    const result = await col.updateOne(filter, {
      $set: updateData,
    });

    if (result.matchedCount === 0) {
      return reply.code(403).send({
        success: false,
        message: "Status can only be updated after the inquiry is assigned",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Inquiry status updated successfully",
    });

  } catch (err) {
    console.error("Update Inquiry Status Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};


// POST /cc/send-message

const sendCcMessage = async (req, reply) => {
  try {
    const { inquiry_id, source, message } = req.body;
    const ccUserId = req.user.id;
    // console.log("inquiry id",inquiry_id)
    // console.log("source",source)
    // console.log("message",message)
    // console.log("cc id",ccUserId)

    if (!message || !message.trim()) {
      return reply.code(400).send({
        success: false,
        message: "Message is required",
      });
    }

    const db = req.server.mongo.db;

    const collectionMap = {
      booking: "bookings",
      contact: "contact",
      service: "services",
    };

    const inquiryCol = db.collection(collectionMap[source]);

    // 🔒 Check inquiry assigned to this CC
    const inquiry = await inquiryCol.findOne({
      _id: new ObjectId(inquiry_id),
      assignedCC: new ObjectId(ccUserId),
    });

    // console.log("inquiry=",inquiry)
    if (!inquiry) {
      return reply.code(403).send({
        success: false,
        message: "You can message only assigned inquiries",
      });
    }

    if(inquiry.status==="Closed"){
        return reply.code(400).send({
          success:false,
          message: "Inquiry is closed. You cannot send messages."
        })
    }

    // ✅ Save message
    await db.collection("messages").insertOne({
      inquiryId: new ObjectId(inquiry_id),
      assignedCC:new ObjectId(ccUserId),
      source: inquiry.source,
      message: message.trim(),
      createdAt: new Date(),
    });

    return reply.send({
      success: true,
      message: "Message sent successfully",
    });

  } catch (err) {
    console.error("Send CC Message Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Server error",
    });
  }
};




 const getInquiryMessages = async (req, reply) => {
  try {
    const { id } = req.params;
    const { source } = req.query;
    const user = req.user; // JWT se
    console.log("user=",user)

    if (!ObjectId.isValid(id)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid inquiry ID",
      });
    }

    if (!["booking", "contact", "service"].includes(source)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid source",
      });
    }

    const db = req.mongo?.db || req.server?.mongo?.db;

    // 🔐 CC-user ke liye authorization
    if (user.role === "cc_user") {
      const collectionMap = {
        booking: "bookings",
        contact: "contact",
        service: "services",
      };

      const inquiry = await db
        .collection(collectionMap[source])
        .findOne({
          _id: new ObjectId(id),
          assignedCC: new ObjectId(user.id),
        });

      if (!inquiry) {
        return reply.code(403).send({
          success: false,
          message: "Not authorized to view this inquiry",
        });
      }
    }

    const messages = await db
      .collection("messages")
      .find({
        inquiryId: new ObjectId(id),
        source,
      })
      .sort({ createdAt: 1 })
      .toArray();

    return reply.send({
      success: true,
      total: messages.length,
      data: messages,
    });

  } catch (err) {
    console.error("Get Inquiry Messages Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Server error",
    });
  }
};




//  const getInquiryMessagesForAdmin = async (req, reply) => {
//   try {
//     const { id } = req.params;         // inquiryId
//     const { source } = req.query;      // booking / contact / service

//     if (!ObjectId.isValid(id)) {
//       return reply.code(400).send({
//         success: false,
//         message: "Invalid inquiry ID",
//       });
//     }

//     if (!["booking", "contact", "services"].includes(source)) {
//       return reply.code(400).send({
//         success: false,
//         message: "Invalid source type",
//       });
//     }

//     const db = req.mongo?.db || req.server?.mongo?.db;
//     const messageCol = db.collection("inquiry_messages");

//     const messages = await messageCol
//       .find({
//         inquiryId: new ObjectId(id),
//         source,
//       })
//       .sort({ createdAt: 1 }) // oldest → newest
//       .toArray();

//     return reply.send({
//       success: true,
//       message: "Message history fetched successfully",
//       totalMessages: messages.length,
//       data: messages,
//     });

//   } catch (error) {
//     console.error("Admin Message History Error:", error);
//     return reply.code(500).send({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };


module.exports = { AllInquiries,assignInquiry,updateInquiryStatus,sendCcMessage,getInquiryMessages };
