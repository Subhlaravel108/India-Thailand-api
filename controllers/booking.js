const { createBookingSchema, formatYupErrors } = require("../validators/booking.validation");
const { sendBookingEmail } = require("../utils/email"); // email bhejne ke liye

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