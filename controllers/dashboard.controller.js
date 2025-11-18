// controllers/dashboard.controller.js

exports.getOverviewCounts = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;

       if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const usersCount = await db.collection("Users").countDocuments();
    const packageCount= await db.collection("packages").countDocuments()
    const contactCount= await db.collection("contact").countDocuments()
    const blogCount = await db.collection("blog").countDocuments();
    const activeToursCount = await db.collection("tours").countDocuments({ status: "Active" });
    const destinationCount = await db.collection("destinations").countDocuments();
    // console.log("user=",usersCount)
    return reply.send({
      success: true,
      data: {
        totalUsers: usersCount,
        totalBlogs: blogCount,
        activeTours: activeToursCount,
        totalDestinations: destinationCount,
        totalContacts:contactCount,
        totalPackges:packageCount
      },
    });
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

exports.getUserGraphStats = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;

    const last7 = new Date();
    last7.setDate(last7.getDate() - 7);

    const pipeline = [
      {
        $match: { createdAt: { $gte: last7 } }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ];

    const result = await db.collection("Users").aggregate(pipeline).toArray();

    return reply.send({ success: true, data: result });

  } catch (err) {
    console.log(err);
    return reply.code(500).send({
      success: false,
      message: "Failed to load user graph data"
    });
  }
};




exports.getBookingsLast30Days = async (req, reply) => {
  try {
    const db = req.server.mongo.db;

    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);

    const pipeline = [
      { $match: { createdAt: { $gte: last30 } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ];

    const result = await db.collection("bookings").aggregate(pipeline).toArray();

    return reply.send({ success: true, data: result });
  } catch (err) {
    console.log(err);
    return reply.code(500).send({
      success: false,
      message: "Failed to load bookings graph data"
    });
  }
};
