const { ObjectId } = require("@fastify/mongodb");

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search ? req.query.search.trim() : "";

    // Build filters for each collection
    const bookingFilter = search
      ? { $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ]}
      : {};

    const contactFilter = search
      ? { $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ]}
      : {};

    const serviceFilter = search
      ? { $or: [
          { "data.name": { $regex: search, $options: "i" } },
          { "data.email": { $regex: search, $options: "i" } },
          { "data.phone": { $regex: search, $options: "i" } },
        ]}
      : {};

    // Count total documents for pagination
    const totalBookings = await bookingCol.countDocuments(bookingFilter);
    const totalContacts = await contactCol.countDocuments(contactFilter);
    const totalServices = await serviceCol.countDocuments(serviceFilter);
    const totalInquiries = totalBookings + totalContacts + totalServices;

    // Calculate skip & limit proportionally (rough estimate)
    const skip = (page - 1) * limit;

    // Fetch data from each collection
    const bookings = await bookingCol.find(bookingFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const contacts = await contactCol.find(contactFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const services = await serviceCol.find(serviceFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Normalize each collection
    const formattedBookings = bookings.map(b => ({
      _id: b._id,
      name: b.fullName,
      email: b.email,
      phone: b.phone,
      message: b.message,
      source: "booking",
      type: b.packageType,
      status: b.status,
      assignedCC: b.assignedCC,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt
    }));

    const formattedContacts = contacts.map(c => ({
      _id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      message: c.message,
      source: "contact",
      type: c.travelInterest || null,
      status: c.status,
      assignedCC: c.assignedCC,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));

    const formattedServices = services.map(s => ({
      _id: s._id,
      name: s.data.name,
      email: s.data.email,
      phone: s.data.phone,
      message: s.data.message,
      source: "service",
      type: s.serviceType,
      status: s.status,
      assignedCC: s.assignedCC,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    }));

    // Merge all
    let allInquiries = [...formattedBookings, ...formattedContacts, ...formattedServices];

    // Sort by createdAt descending
    allInquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply final pagination
    const paginatedInquiries = allInquiries.slice(0, limit); // already fetched limited per collection

    return reply.code(200).send({
      success: true,
      message: "Inquiries fetched successfully",
      pagination: {
        total: totalInquiries,
        page,
        limit,
        totalPages: Math.ceil(totalInquiries / limit)
      },
      data: paginatedInquiries
    });

  } catch (err) {
    console.error("Get All Inquiries Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
};

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


module.exports = { AllInquiries,assignInquiry,updateInquiryStatus };
