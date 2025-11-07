const { ObjectId } = require("mongodb");
const { createPackageSchema } = require("../validators/package.validator");


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

const getPackages = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const packageCol = db.collection("packages");

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

    const total = await packageCol.countDocuments(query);
    const packages = await packageCol
      .find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .toArray();

    return reply.code(200).send({
      success: true,
      message: "Tours Packages fetched successfully",
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      data: packages,
    });

  } catch (err) {
    console.error("Get Tours package Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// module.exports = { getPackages };


const createSlug = async (title, packages) => {
  let slug = title.trim().toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, "");

  let exists = await packages.findOne({ slug });
  let counter = 1;

  while (exists) {
    let newSlug = `${slug}-${counter}`;
    exists = await packages.findOne({ slug: newSlug });
    if (!exists) {
      slug = newSlug;
      break;
    }
    counter++;
  }

  return slug;
};

const createPackage = async (req, reply) => {
  try {
    // const { title, shortDescription, imageUrl,status } = req.body;
    
    const body=req.body || {};


      try {
      await createPackageSchema.validate(body, { abortEarly: false });
    } catch (validationError) {
      return reply.code(400).send({
        success: false,
        message: "Validation Failed",
        errors: formatYupErrors(validationError),
      });
    }
    

    const db = req.server.mongo.db;
    const packages = db.collection("packages");

    const existing = await packages.findOne({ title: body.title.trim() });
    if (existing)
      return reply.code(409).send({
        success: false,
        message: "Package title already exists!"
      });
      

    // ✅ Generate unique slug
    const slug = await createSlug(body.title, packages);

    const newPackage = {
      title: body.title.trim(),
      slug,
      shortDescription: body.shortDescription.trim(),
      imageUrl:body.imageUrl,
      status:body.status,
      createdAt: new Date()
    };

    const result = await packages.insertOne(newPackage);

    return reply.code(201).send({
      success: true,
      message: "Package created successfully ✅",
      data: { id: result.insertedId, slug }
    });

  } catch (error) {
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error ❌",
      error: error.message
    });
  }
};


const updatePackage = async (req, reply) => {
  try {
    const { slug } = req.params;
    const body=req.body || {};


      try {
      await createPackageSchema.validate(body, { abortEarly: false });
    } catch (validationError) {
      return reply.code(400).send({
        success: false,
        message: "Validation Failed",
        errors: formatYupErrors(validationError),
      });
    }

 

    const db = req.server.mongo.db;
    const packages = db.collection("packages");

    const existing = await packages.findOne({ slug });
    if (!existing) {
      return reply.code(404).send({
        success: false,
        message: "Package not found ❌",
      });
    }

    let newSlug = existing.slug;

    // ✅ Title change hone par unique slug regenerate karenge
    if (body.title.trim() !== existing.title) {
      let baseSlug = body.title.trim().toLowerCase().replace(/ /g, "-");
      let slugCheck = baseSlug;
      let counter = 1;

      while (await packages.findOne({ slug: slugCheck })) {
        slugCheck = `${baseSlug}-${counter++}`;
      }

      newSlug = slugCheck;
    }

    const updateData = {
      title: body.title.trim(),
      slug: newSlug,
      shortDescription: body.shortDescription.trim(),
      status:body.status,
      imageUrl:body.imageUrl,
      updatedAt: new Date(),
    };

    await packages.updateOne(
      { slug },
      { $set: updateData }
    );

    return reply.code(200).send({
      success: true,
      message: "Package updated successfully ✅",
      data: updateData,
    });

  } catch (error) {
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error ❌",
      error: error.message,
    });
  }
};

// Delete package by slug
// const deletePackage = async (req, reply) => {
//   try {
//     const { slug } = req.params;

//     if (!slug) {
//       return reply.code(400).send({
//         success: false,
//         message: "Slug is required!"
//       });
//     }

//     const db = req.server.mongo.db;
//     const packages = db.collection("packages");

//     const result = await packages.findOneAndDelete({ slug });

//   if (result.deletedCount === 0) {
//       return reply.code(404).send({
//         success: false,
//         message: "Package not found!"
//       });
//     }

//     return reply.code(200).send({
//       success: true,
//       message: "Package deleted successfully ✅"
//     });

//   } catch (error) {
//     return reply.code(500).send({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message
//     });
//   }
// };


const deletePackage = async (req, reply) => {
  try {
    const { id } = req.params;
    console.log("id=",id)
    // Validate ObjectId
    if (!id || !ObjectId.isValid(id)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid or missing package ID",
      });
    }

    const db = req.server.mongo.db;
    const packages = db.collection("packages");

    // Check if package exists
    const existing = await packages.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return reply.code(404).send({
        success: false,
        message: "Package not found!",
      });
    }

    // Delete package
    const result = await packages.deleteOne({ _id: new ObjectId(id) });

    return reply.code(200).send({
      success: true,
      message: "Package deleted successfully ✅",
    });

  } catch (error) {
    console.error("Delete Package Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};





const getPackageBySlug = async (req, reply) => {
  try{
     const {slug}=req.params;
     const package= await req.server.mongo.db.collection("packages").findOne({slug});
     if(!package){
      return reply.code(404).send({
        success:false,
        message:"Package not found"
      });
     }
      return reply.code(200).send({
        success:true,
        message:"Package fetched successfully",
        data:package
      });
  }catch(error){
    return reply.code(500).send({
      success:false,
      message:"Something went wrong",
      error:error.message
    });

  }
}


const getFrontPackages = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const packageCol = db.collection("packages");

    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // ✅ Search filter on title + shortDescription
    const query ={ 
    status:"Active",
    ...(  search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { shortDescription: { $regex: search, $options: "i" } },
          ],
        }
      : {}),
      }
    const total = await packageCol.countDocuments(query);
    const packages = await packageCol
      .find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .toArray();

    return reply.code(200).send({
      success: true,
      message: "Tours Packages fetched successfully",
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      data: packages,
    });

  } catch (err) {
    console.error("Get Tours package Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


module.exports = {getPackages, createPackage,updatePackage,deletePackage,getPackageBySlug,getFrontPackages };
