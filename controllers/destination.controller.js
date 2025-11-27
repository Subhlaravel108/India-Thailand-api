const { json } = require("stream/consumers");
const {createDenstinationSchema}=require("../validators/destination.validator");
const slugify = require("slugify");

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
}

const generateUniqueSlug = async (baseTitle, collection) => {
  const base = slugify(String(baseTitle || "blog"), { lower: true, strict: true }).slice(0, 120) || "blog";
  let slug = base;
  let counter = 1;
  while (await collection.findOne({ slug })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
};

exports.createDestination=async(req,reply)=>{
   try{
        const body=req.body;

        try{
            await createDenstinationSchema.validate(body,{abortEarly:false});
        }
        catch(validationError){
            return reply.code(400).send({
                success:false,  
                message:"Validation Failed",
                errors:formatYupErrors(validationError),
            });
        }
        const db=req.mongo?.db || req.server?.mongo?.db;
        if(!db){
            return reply.code(500).send({
                success:false,
                message:"Database connection not available",
            });
        }
        const destinationsCol=db.collection("destinations");

        const slug=await generateUniqueSlug(body.title,destinationsCol);

        const destinationData={
            title:body.title.trim(),
            slug,
            description:body.description?.trim() || "",
            featured_image:body.featured_image?.trim() || "",
            meta_title:body.meta_title?.trim() || "",
            meta_description:body.meta_description?.trim() || "",
            meta_keywords:body.meta_keywords?.trim() || "",
            gallery:body.gallery || [],
            status:body.status,
            showingOnHomePage: body.showingOnHomePage,
            short_description:body.short_description?.trim() || "",
            createdAt:new Date(),
            updatedAt:new Date(),
        };
        const result=await destinationsCol.insertOne(destinationData);

        return reply.code(201).send({
            success:true,
            message:"Destination created successfully ✅",
            destinationId:result.insertedId,
        });

   }
    catch(error){
        console.error("Create Destination Error:",error);

        return reply.code(500).send({
            success:false,
            message:"Internal Server Error ❌",
            error:error.message,
        });
    }
};


exports.updateDestination=async(req,reply)=>{
    try{
        const {slug}=req.params;
        const body=req.body || {};
        try{
            await createDenstinationSchema.validate(body,{abortEarly:false});

        }
        catch(validationError){
            return reply.code(400).send({
                success:false,
                message:"Validation Failed",
                errors:formatYupErrors(validationError),
            });
        }
        const db=req.mongo?.db || req.server?.mongo?.db;
        if(!db){
            return reply.code(500).send({
                success:false,
                message:"Database connection not available",
            });
        }
        const destinationsCol=db.collection("destinations");

        const existingDestination=await destinationsCol.findOne({slug});
        if(!existingDestination){
            return reply.code(404).send({
                success:false,
                message:"Destination not found",
            });
        }
        let newSlug=existingDestination.slug;
        if(body.title && body.title.trim()!==existingDestination.title){
            newSlug=await generateUniqueSlug(body.title,destinationsCol);
        }
        const updatedData={
            title:body.title?.trim(),
            slug:newSlug,
            description:body.description?.trim(),
            featured_image:body.featured_image?.trim(),
            meta_title:body.meta_title?.trim(),
            meta_description:body.meta_description?.trim(),
            meta_keywords:body.meta_keywords?.trim(),
            gallery:body.gallery || [],
            showingOnHomePage: body.showingOnHomePage,
            status:body.status,
            short_description:body.short_description?.trim(),
            updatedAt:new Date(),
        };
        const existingTitleDestination=await destinationsCol.findOne({title:updatedData.title,_id:{$ne:existingDestination._id}});
        if(existingTitleDestination){
            return reply.code(409).send({
                success:false,
                message:"Another destination with this title already exists",
            });
        }
        await destinationsCol.updateOne({slug},{$set:updatedData});

        return reply.code(200).send({
            success:true,
            message:"Destination updated successfully ✅",
            data:{...existingDestination,...updatedData,slug:newSlug},
        });


    }
    catch(error){
        console.error("Update Destination Error:",error);
        return reply.code(500).send({
            success:false,
            message:"Internal Server Error ❌",
            error:error.message,
        });
    }
};


exports.getAllDestination = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const destinations = db.collection("destinations");

    // Query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const search = req.query.search ? req.query.search.trim() : "";
    const download = req.query.download === "true";
    const type = req.query.type || "all"; // homepage | all

    const filter = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    // DOWNLOAD SECTION
    if (download) {
      let downloadFilter = { ...filter };

      // Only homepage data
      if (type === "homepage") {
        downloadFilter.showingOnHomePage = true;
      }

      const totalDocuments = await destinations.countDocuments(downloadFilter);

      const allData = await destinations
        .find(downloadFilter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit) // ✔️ Skip applied
        .limit(limit) // ✔️ Limit applied
        .toArray();

        const totalPages = Math.ceil(totalDocuments / limit);

       const jsonData = JSON.stringify({
    success: true,
    pagination: { total: totalDocuments, page, limit, totalPages },
    data: allData,
  }, null, 2);

      const fileName =
        type === "homepage"
          ? "destinations_homepage.json"
          : "all_destinations.json";

      return reply
        .header("Content-Type", "application/json")
        .header(
          "Content-Disposition",
          `attachment; filename=${fileName}`
        )
        .send(jsonData);
    }

    // NORMAL LIST (Pagination)
    const totalCategories = await destinations.countDocuments(filter);

    const categories = await destinations
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const totalPages = Math.ceil(totalCategories / limit);

    return reply.code(200).send({
      success: true,
      message: "Destination fetched successfully",
      pagination: { total: totalCategories, page, limit, totalPages },
      data: categories,
    });

  } catch (err) {
    console.error("Get All destinations Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};




exports.getDestinationDetails=async(req,reply)=>{
    try{
        const {slug}=req.params;
        const db=req.mongo?.db || req.server?.mongo?.db;
        if(!db){
            return reply.code(500).send({
                success:false,
                message:"Database connection not available",
            });
        }
        const destinationsCol=db.collection("destinations");

        const destination=await destinationsCol.findOne({slug});
        if(!destination){
            return reply.code(404).send({
                success:false,
                message:"Destination not found",
            });
        }
        return reply.code(200).send({
            success:true,
            message:"Destination details fetched successfully",
            data:destination,
        });
    }catch(err){
        console.error("Get Destination Details Error:",err);
        return reply.code(500).send({
            success:false,
            message:"Internal Server Error",
            error:err.message,
        });
    }


}

exports.deleteDestination=async(req,reply)=>{
    try{
        const {id}=req.params;
        const db=req.mongo?.db || req.server?.mongo?.db;
        if(!db){
            return reply.code(500).send({
                success:false,
                message:"Database connection not available",
            })
        }
        const destinationsCol=db.collection("destinations");
        const {ObjectId}=require("mongodb");

        const existingDestination=await destinationsCol.findOne({_id:new ObjectId(id)});
        if(!existingDestination){
            return reply.code(404).send({
                success:false,
                message:"Destination not found",
            });  
        }
        await destinationsCol.deleteOne({_id:new ObjectId(id)});

        return reply.code(200).send({
            success:true,
            message:"Destination deleted successfully ✅",
        });
    }catch(err){
        console.error("Delete Destination Error:",err);
        return reply.code(500).send({
            success:false,
            message:"Internal Server Error",
            error:err.message,
        });
    }
};



exports.getFrontAllDestination = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const destinations = db.collection("destinations");

    // 🔹 Query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const search = req.query.search ? req.query.search.trim() : "";

    // 🔹 Filter: only active + optional search by title
    const filter = {
      status: "Active", // 👈 Only show active destinations
      ...(search
        ? { title: { $regex: search, $options: "i" } } // case-insensitive search
        : {}),
    };

    // 🔹 Count total documents
    const totalDestinations = await destinations.countDocuments(filter);

    // 🔹 Fetch paginated destinations
    const destinationList = await destinations
      .find(filter)
      .sort({ createdAt: -1 }) // latest first
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // 🔹 Pagination info
    const totalPages = Math.ceil(totalDestinations / limit);

    return reply.code(200).send({
      success: true,
      message: "Destinations fetched successfully",
      pagination: {
        total: totalDestinations,
        page,
        limit,
        totalPages,
      },
      data: destinationList,
    });

  } catch (err) {
    console.error("Get All Destinations Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


exports.getFrontDestinationDetails=async(req,reply)=>{
    try{
        const {slug}=req.params;
        const db=req.mongo?.db || req.server?.mongo?.db;
        if(!db){
            return reply.code(500).send({
                success:false,
                message:"Database connection not available",
            });
        }
        const destinationsCol=db.collection("destinations");

        const destination=await destinationsCol.findOne({slug});
        if(!destination){
            return reply.code(404).send({
                success:false,
                message:"Destination not found",
            });
        }
        return reply.code(200).send({
            success:true,
            message:"Destination details fetched successfully",
            data:destination,
        });
    }catch(err){
        console.error("Get Destination Details Error:",err);
        return reply.code(500).send({
            success:false,
            message:"Internal Server Error",
            error:err.message,
        });
    }


}

exports.getToursByDestinationSlug = async (req, reply) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // ✅ DB Connection
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const toursCol = db.collection("tours");
    const destinationsCol = db.collection("destinations");

    // ✅ Find destination by slug
    const destination = await destinationsCol.findOne({ slug });
    if (!destination) {
      return reply.code(404).send({
        success: false,
        message: "Destination not found",
      });
    }

    // ✅ Build search condition
    const searchCondition = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { shortDescription: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // ✅ Main query filter (Only Active tours)
    const filter = {
      destinationIds: { $in: [destination._id] },
      status: "Active",
      ...searchCondition,
    };

    // ✅ Count total matching documents
    const totalTours = await toursCol.countDocuments(filter);

    // ✅ Get paginated tours
    const tours = await toursCol
      .find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .toArray();

    // ✅ If no tours found
    if (!tours.length) {
      return reply.send({
        success: true,
        message: "No active tours found for this destination",
        destination: {
          id: destination._id,
          title: destination.title,
          slug: destination.slug,
        },
        total: 0,
        currentPage: Number(page),
        totalPages: 0,
        data: [],
      });
    }

    // ✅ Success response
    return reply.send({
      success: true,
      message: `Active tours fetched successfully for destination: ${destination.title}`,
      destination: {
        id: destination._id,
        title: destination.title,
        slug: destination.slug,
      },
      total: totalTours,
      currentPage: Number(page),
      totalPages: Math.ceil(totalTours / Number(limit)),
      limit: Number(limit),
      data: tours,
    });
  } catch (err) {
    console.error("Error fetching tours by destination slug:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
 

 exports.getAllDestinationByIds=async(req,reply)=>{
    try{
        const {ids}=req.body;
        const db=req.mongo?.db || req.server?.mongo?.db;
        if(!db){
            return reply.code(500).send({
                success:false,
                message:"Database connection not available",
            });
        }
        const destinationsCol=db.collection("destinations");


        const {ObjectId}=require("mongodb");

        const objectIds=ids.map(id=>new ObjectId(id));

        const destinations=await destinationsCol.find({_id:{$in:objectIds}}).project({
          title: 1,
          slug: 1,
          featured_image : 1,
          short_description: 1,
          createdAt: 1,
        }).toArray();
        return reply.code(200).send({
            success:true,
            message:"Destinations fetched successfully",
            data:destinations,
        });
    }catch(err){
        console.error("Get Destinations By Ids Error:",err);
        return reply.code(500).send({
            success:false,
            message:"Internal Server Error",
            error:err.message,
        });
    }
}