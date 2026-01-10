const { createBookingSchema, formatYupErrors } = require("../validators/booking.validation");
const { sendBookingEmail } = require("../utils/email"); // email bhejne ke liye
const ExcelJS = require("exceljs");

exports.Booking = async (req, reply) => {
  try {
    const body = req.body;

    // ✅ Step 1: Validate input
    await createBookingSchema.validate(body, { abortEarly: false });

    // ✅ Step 2: Get MongoDB connection
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    // ✅ Step 3: Prepare data
    const bookingCol = db.collection("bookings");
    const bookingData = {
      fullName: body.fullName.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      destination: body.destination.trim(),
      packageType: body.packageType.trim(),
      travelers: Number(body.travelers),
      travelDate: body.travelDate.trim(),
      message: body.message?.trim() || "",
      source: "booking",
      status:"New",
      assignedCC: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // ✅ Step 4: Insert in MongoDB
    const insertResult = await bookingCol.insertOne(bookingData);

    // ✅ Step 5: Send email confirmation
    const emailResult = await sendBookingEmail(body);

    if (!emailResult.success) {
      console.error("❌ Email sending failed:", emailResult.error);
      return reply.code(500).send({
        success: false,
        message: "Booking saved, but failed to send confirmation email.",
      });
    }

    // ✅ Step 6: Success Response
    return reply.code(200).send({
      success: true,
      message: "Your booking request has been received! A confirmation email has been sent.",
      data: { bookingId: insertResult.insertedId },
    });

  } catch (error) {
    // 🧩 Validation Error
    if (error.name === "ValidationError") {
      const formattedErrors = formatYupErrors(error);
      return reply.code(400).send({ success: false, errors: formattedErrors });
    }

    // 🧩 Unexpected Error
    console.error("💥 Booking API Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Server error occurred.",
      error: error.message,
    });
  }
};



exports.getAllBookings=async(req,reply)=>{
    try{
        const db=req.mongo?.db || req.server.mongo.db
        if(!db){
          return reply.code(500).send({
            success:false,
            message:"Database connection not available"
          })
        }

        const bookingCol=await db.collection("bookings")
        const page=parseInt(req.query.page) || 1
        const limit=parseInt(req.query.limit) || 10
        const search=req.query.search ? req.query.search.trim() : ""

       
       const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { number: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const totalBookings= await bookingCol.countDocuments(filter)

    const bookings=  await bookingCol.find(filter).sort({createdAt: -1}).skip((page-1) * limit).limit(limit).toArray()

    const totalPages= Math.ceil(totalBookings/limit)

     return reply.code(200).send({
      success: true,
      message: "Bookings fetched successfully",
      pagination: {
        total: totalBookings,
        page,
        limit,
        totalPages,
      },
      data: bookings,
    });
  } catch (err) {
    console.error("Get All Bookings Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};




exports.exportBookings = async (req, reply) => {
  try {
    const bookingCollection = req.server.mongo.db.collection("bookings");

    const bookings = await bookingCollection.find().toArray();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bookings");

    worksheet.columns = [
      { header: "Full Name", key: "fullName", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Destination", key: "destination", width: 20 },
      { header: "Package Type", key: "packageType", width: 25 },
      { header: "Travelers", key: "travelers", width: 10 },
      { header: "Travel Date", key: "travelDate", width: 20 },
      { header: "Message", key: "message", width: 30 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    bookings.forEach((b) => {
      worksheet.addRow({
        fullName: b.fullName,
        email: b.email,
        phone: b.phone,
        destination: b.destination,
        packageType: b.packageType,
        travelers: b.travelers,
        travelDate: b.travelDate,
        message: b.message || "-",
        createdAt: new Date(b.createdAt).toLocaleString("en-IN"),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    reply
      .header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
      .header("Content-Disposition", "attachment; filename=bookings.xlsx")
      .send(buffer);
  } catch (err) {
    console.log(err);
    reply.code(500).send({ message: "Failed to export bookings" });
  }
};


