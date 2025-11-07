// controllers/tour.controller.js
const { ObjectId } = require("mongodb");
const slugify = require("slugify");
const { createTourSchema } = require("../validators/tour.validator");

// helper: map yup inner errors to field->message
const formatYupErrors = (yupError) => {
  const errors = {};
  if (yupError.inner && yupError.inner.length) {
    for (const err of yupError.inner) {
      // only set first error per path
      if (err.path && !errors[err.path]) errors[err.path] = err.message;
    }
  } else if (yupError.path) {
    errors[yupError.path] = yupError.message;
  }
  return errors;
};

// helper: generate unique slug
const generateUniqueSlug = async (baseTitle, collection) => {
  const base = slugify(baseTitle, { lower: true, strict: true }).slice(0, 120) || "tour";
  let slug = base;
  let counter = 1;

  while (await collection.findOne({ slug })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
};



exports.createTour = async (req, reply) => {
  try {
    const body = req.body || {};

    // ✅ Validate request body using Yup
    try {
      await createTourSchema.validate(body, { abortEarly: false });
    } catch (validationError) {
      return reply.code(400).send({
        success: false,
        message: "Validation Failed",
        errors: formatYupErrors(validationError),
      });
    }

    // ✅ Database connection
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const toursCol = db.collection("tours");
    const packagesCol = db.collection("packages");
    const destinationsCol = db.collection("destinations");

    // ✅ Validate and find packageId
    const { packageId, destinationIds } = body;

    if (!ObjectId.isValid(packageId)) {
      return reply.code(400).send({
        success: false,
        message: "Validation Failed",
        errors: { packageId: "packageId is not a valid ObjectId" },
      });
    }

    const pkg = await packagesCol.findOne({ _id: new ObjectId(packageId) });
    if (!pkg) {
      return reply.code(404).send({
        success: false,
        message: "Package not found",
      });
    }

    // ✅ Validate destinationIds (must be array of valid ObjectIds)
    if (!Array.isArray(destinationIds) || destinationIds.length === 0) {
      return reply.code(400).send({
        success: false,
        message: "Validation Failed",
        errors: { destinationIds: "destinationIds must be a non-empty array" },
      });
    }

    const invalidDestIds = destinationIds.filter((id) => !ObjectId.isValid(id));
    if (invalidDestIds.length > 0) {
      return reply.code(400).send({
        success: false,
        message: "Validation Failed",
        errors: { destinationIds: "One or more destinationIds are invalid ObjectIds" },
      });
    }

    // ✅ Optional: check if all destinationIds exist
    const foundDestinations = await destinationsCol
      .find({ _id: { $in: destinationIds.map((id) => new ObjectId(id)) } })
      .toArray();

    if (foundDestinations.length !== destinationIds.length) {
      return reply.code(404).send({
        success: false,
        message: "One or more destinationIds not found",
      });
    }

    // ✅ Generate unique slug
    const slug = await generateUniqueSlug(body.title, toursCol);

    // ✅ Prepare new tour data
    const newTour = {
      title: body.title.trim(),
      slug,
      meta_title: body.meta_title.trim(),
      meta_description: body.meta_description.trim(),
      meta_keywords: body.meta_keywords,
      itinerary: body.itinerary,
      shortDescription: body.shortDescription.trim(),
      description: body.description.trim(),
      featureImage: body.featureImage,
      gallery: body.gallery,
      tour_duration: body.tour_duration,
      price: Number(body.price),
      people: body.people,
      countries: body.countries,
      hotelType: body.hotelType,
      travelInsuranceIncluded: Boolean(body.travelInsuranceIncluded),
      included: body.included,
      notIncluded: Array.isArray(body.notIncluded) ? body.notIncluded : [],
      status: body.status,
      packageId: new ObjectId(packageId),

      // ✅ Store destinationIds as array of ObjectIds
      destinationIds: destinationIds.map((id) => new ObjectId(id)),

      createdAt: new Date(),
    };

    // ✅ Insert into database
    const result = await toursCol.insertOne(newTour);

    return reply.code(201).send({
      success: true,
      message: "Tour created successfully",
      data: { id: result.insertedId, slug },
    });
  } catch (err) {
    console.error("Create Tour Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};




exports.updateTourBySlug = async (req, reply) => {
  try {
    const { slug } = req.params;
    const body = req.body;
    const db = req.mongo?.db || req.server?.mongo?.db;

    const toursCol = db.collection("tours");
    const packagesCol = db.collection("packages");
    const destinationsCol = db.collection("destinations");

    // ✅ 1. Check if tour exists
    const oldTour = await toursCol.findOne({ slug });
    if (!oldTour) {
      return reply.code(404).send({
        success: false,
        message: "Tour not found",
      });
    }

    // ✅ 2. Validate packageId
    if (!ObjectId.isValid(body.packageId)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid packageId format",
      });
    }

    const packageExists = await packagesCol.findOne({
      _id: new ObjectId(body.packageId),
    });
    if (!packageExists) {
      return reply.code(404).send({
        success: false,
        message: "Package not found",
      });
    }

    // ✅ 3. Validate destinationIds (array)
    if (!Array.isArray(body.destinationIds) || body.destinationIds.length === 0) {
      return reply.code(400).send({
        success: false,
        message: "Validation Failed",
        errors: { destinationIds: "destinationIds must be a non-empty array" },
      });
    }

    const invalidDestIds = body.destinationIds.filter((id) => !ObjectId.isValid(id));
    if (invalidDestIds.length > 0) {
      return reply.code(400).send({
        success: false,
        message: "Validation Failed",
        errors: { destinationIds: "One or more destinationIds are invalid ObjectIds" },
      });
    }

    const foundDestinations = await destinationsCol
      .find({ _id: { $in: body.destinationIds.map((id) => new ObjectId(id)) } })
      .toArray();

    if (foundDestinations.length !== body.destinationIds.length) {
      return reply.code(404).send({
        success: false,
        message: "One or more destinationIds not found",
      });
    }

    // ✅ 4. Validate full schema using Yup
    await createTourSchema.validate(body, { abortEarly: false });

    // ✅ 5. Regenerate slug only if title changed
    let newSlug = oldTour.slug;
    if (body.title.trim() !== oldTour.title) {
      newSlug = await generateUniqueSlug(body.title, toursCol);
    }

    // ✅ 6. Prepare updatedTour object
    const updatedTour = {
      title: body.title.trim(),
      meta_title: body.meta_title.trim(),
      meta_description: body.meta_description.trim(),
      meta_keywords: body.meta_keywords.trim(),
      itinerary: body.itinerary,
      shortDescription: body.shortDescription.trim(),
      description: body.description.trim(),
      featureImage: body.featureImage.trim(),
      gallery: body.gallery,
      tour_duration: body.tour_duration, // make sure type consistent
      price: Number(body.price),
      people: body.people.trim(),
      countries: body.countries.trim(),
      hotelType: body.hotelType.trim(),
      travelInsuranceIncluded: Boolean(body.travelInsuranceIncluded),
      included: body.included,
      notIncluded: body.notIncluded || [],
      packageId: new ObjectId(body.packageId),
      destinationIds: body.destinationIds.map((id) => new ObjectId(id)),
      status: body.status,
      slug: newSlug,
      updatedAt: new Date(),
    };

    // ✅ 7. Update tour by _id instead of slug (safe if slug changed)
    await toursCol.updateOne(
      { _id: oldTour._id },
      { $set: updatedTour }
    );

    return reply.code(200).send({
      success: true,
      message: "Tour updated successfully",
      slug: newSlug,
    });
  } catch (error) {
    console.error("Error updating tour:", error);
    if (error.name === "ValidationError") {
      const validationErrors = {};
      error.inner.forEach((err) => {
        validationErrors[err.path] = err.message;
      });
      return reply.code(400).send({
        success: false,
        message: "Validation Failed",
        errors: validationErrors,
      });
    }
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};


exports.getToursBySlug = async (req, reply) => {
    try {   
    const { slug } = req.params;
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }
    const toursCol = db.collection("tours");
    const tour = await toursCol.findOne({ slug });

    if (!tour) {    
        return reply.code(404).send({
        success: false,
        message: "Tour not found",
      });
    }
    return reply.code(200).send({
        success: true,
        message: "Tour fetched successfully",
        data: tour,
      });
    } catch (err) {
        console.error("Get Tour Error:", err);
    return reply.code(500).send({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
};

exports.getTours = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const toursCol = db.collection("tours");

    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // ✅ Search filter on title + shortDescription
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { shortDescription: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await toursCol.countDocuments(query);
    const tours = await toursCol
      .find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .toArray();

    return reply.code(200).send({
      success: true,
      message: "Tours fetched successfully",
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      data: tours,
    });

  } catch (err) {
    console.error("Get Tours Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


exports.deleteTourById=async(req,reply)=>{
    try{
        const{id}=req.params;
        const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }
      const toursCol = db.collection("tours");
        const result=await toursCol.deleteOne({_id:new ObjectId(id)});
        if(result.deletedCount===0){
            return reply.code(404).send({
                success:false,
                message:"Tour not found"
            });
        }
        return reply.code(200).send({
            success:true,
            message:"Tour deleted successfully"
        });
    }catch(err){
        console.error("Delete Tour Error:", err);
    return reply.code(500).send({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
};

// controllers/tourController.js
// const { ObjectId } = require('mongodb');

// controllers/tourController.js


exports.getToursByPackageSlug = async function (req, reply) {
  try {
    const slug = req.params?.slug;
    const { search = "", page = 1, limit = 10 } = req.query;

    if (!slug) {
      return reply.code(400).send({ success: false, message: "Slug is required" });
    }

    const db = req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({ success: false, message: "Database not connected" });
    }

    const Package = db.collection("packages");
    const Tour = db.collection("tours");

    // find package by slug
    const pkg = await Package.findOne({ slug });
    if (!pkg) {
      return reply.code(404).send({ success: false, message: "Package not found" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ✅ Search + Only active tours
    const searchFilter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { shortDescription: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // ✅ Main query: packageId + active status + optional search
    const query = {
      packageId: new ObjectId(pkg._id),
      status: "Active", // 👈 Only active tours will be fetched
      ...searchFilter,
    };

    const total = await Tour.countDocuments(query);
    const tours = await Tour.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();

    return reply.code(200).send({
      success: true,
      package: pkg.title,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      tours,
    });
  } catch (error) {
    console.error("🔥 Controller Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



exports.getFrontTours = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const toursCol = db.collection("tours");

    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // ✅ Search filter + only active tours
    const query = {
      status: "Active", // ← Only fetch active tours
      ...(search
        ? {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { shortDescription: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    };

    const total = await toursCol.countDocuments(query);
    const tours = await toursCol
      .find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .toArray();

    return reply.code(200).send({
      success: true,
      message: "Tours fetched successfully",
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      data: tours,
    });
  } catch (err) {
    console.error("Get Tours Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};



exports.getFrontToursBySlug = async (req, reply) => {
    try {   
    const { slug } = req.params;
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }
    const toursCol = db.collection("tours");
    const tour = await toursCol.findOne({ slug });

    if (!tour) {    
        return reply.code(404).send({
        success: false,
        message: "Tour not found",
      });
    }
    return reply.code(200).send({
        success: true,
        message: "Tour fetched successfully",
        data: tour,
      });
    } catch (err) {
        console.error("Get Tour Error:", err);
    return reply.code(500).send({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
}; 