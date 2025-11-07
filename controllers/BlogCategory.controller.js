// const { status } = require("nprogress");
const { createCategorySchema } = require("../validators/blogCategory.validator");
// const { generateUniqueSlug } = require("../helpers/slugHelper");
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
};


const generateUniqueSlug = async (baseTitle, collection) => {
  const base = slugify(String(baseTitle || "blog"), { lower: true, strict: true }).slice(0, 120) || "blog";
  let slug = base;
  let counter = 1;
  while (await collection.findOne({ slug })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
};
exports.createBlogCategory = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const categoriesCol = db.collection("blogCategories");
    const body = req.body;

    // ✅ Validate request body
    try {
      await createCategorySchema.validate(body, { abortEarly: false });
    } catch (validationError) {
      return reply.code(400).send({
        success: false,
        message: "Validation Failed",
        errors: formatYupErrors(validationError),
      });
    }

    // ✅ Generate unique slug
    const slug = await generateUniqueSlug(body.title, categoriesCol);

    // ✅ Prepare category data
    const categoryData = {
      title: body.title.trim(),
      slug,
      description: body.description?.trim() || "",
      meta_title: body.meta_title?.trim() || "",
      meta_description: body.meta_description?.trim() || "",
      meta_keywords: body.meta_keywords?.trim() || "",
      image: body.image?.trim() || "",
      status: body.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existingCategory = await categoriesCol.findOne({ title: categoryData.title });
    if (existingCategory) {
      return reply.code(409).send({
        success: false,
        message: "Category with this title already exists",
      });
    }


    // ✅ Insert into DB
    const result = await categoriesCol.insertOne(categoryData);

    return reply.code(201).send({
      success: true,
      message: "Category created successfully",
      data: { _id: result.insertedId, ...categoryData },
    });
  } catch (err) {
    console.error("Create Category Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

exports.updateBlogCategory = async (req, reply) => {
  const {slug}=req.params;
  const body=req.body || {}

  try{
      await createCategorySchema.validate(body,{abortEarly:false});
    }catch(validationError){
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
    const categoriesCol=db.collection("blogCategories");
    const existingCategory=await categoriesCol.findOne({slug});
    if(!existingCategory){
        return reply.code(404).send({
            success:false,
            message:"Category not found",
        });
    }
    
    let newSlug=existingCategory.slug;
    if(body.title && body.title.trim()!==existingCategory.title){
        newSlug=await generateUniqueSlug(body.title,categoriesCol);
    }
    const updatedData={
        title:body.title?.trim(),
        slug:newSlug,
        description:body.description?.trim(),
        meta_title:body.meta_title?.trim(),
        meta_description:body.meta_description?.trim(),
        meta_keywords:body.meta_keywords?.trim(),
        status:body.status,
        image:body.image?.trim(),
        updatedAt:new Date(),
    };
    const existingTitleCategory=await categoriesCol.findOne({title:updatedData.title,_id:{$ne:existingCategory._id}});
    if(existingTitleCategory){
        return reply.code(409).send({
            success:false,
            message:"Another category with this title already exists",
        });
    }

    await categoriesCol.updateOne({slug},{$set:updatedData});

    return reply.code(200).send({
        success:true,
        message:"Category updated successfully",
        data:{...existingCategory,...updatedData,slug:newSlug},
    });

}

exports.getAllBlogCategory = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const categoryCol = db.collection("blogCategories");

    // 🔹 Query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search ? req.query.search.trim() : "";

    // 🔹 Filter only by title
    const filter = search
      ? { title: { $regex: search, $options: "i" } } // case-insensitive search
      : {};

    // 🔹 Count total documents
    const totalCategories = await categoryCol.countDocuments(filter);

    // 🔹 Fetch paginated categories
    const categories = await categoryCol
      .find(filter)
      .sort({ createdAt: -1 }) // latest first
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // 🔹 Pagination info
    const totalPages = Math.ceil(totalCategories / limit);

    return reply.code(200).send({
      success: true,
      message: "Blog categories fetched successfully",
      pagination: {
        total: totalCategories,
        page,
        limit,
        totalPages,
      },
      data: categories,
    });

  } catch (err) {
    console.error("Get All Blog Categories Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

exports.getBlogCategoryDetails=async(req,reply)=>{
    try{
        const {slug}=req.params;
        const db=req.mongo?.db || req.server?.mongo?.db;
        if(!db){
                return reply.code(500).send({
                    success:false,
                    message:"Database connection not available",
                });
        }
        const categoriesCol=db.collection("blogCategories");
        const category=await categoriesCol.findOne({slug});
        if(!category){
            return reply.code(404).send({
                success:false,
                message:"Category not found",
            });

        }
        return reply.code(200).send({
            success:true,
            message:"Category details fetched successfully",
            data:category,
        });
    }catch(err){
        console.error("Get Category Details Error:",err);
        return reply.code(500).send({
            success:false,
            message:"Internal Server Error",
            error:err.message,
        });
    }
}

exports.deleteBlogCategory=async(req,reply)=>{
    try{
        const {id}=req.params;
        const db=req.mongo?.db || req.server?.mongo?.db;
        if(!db){
                return reply.code(500).send({
                    success:false,
                    message:"Database connection not available",
                });
        }
        const categoriesCol=db.collection("blogCategories");
        const {ObjectId}=require("mongodb");
        const result=await categoriesCol.deleteOne({_id:new ObjectId(id)});
        if(result.deletedCount===0){
            return reply.code(404).send({
                success:false,
                message:"Category not found or already deleted",
            });
        }
        return reply.code(200).send({
            success:true,
            message:"Category deleted successfully",
        });
    }catch(err){
        console.error("Delete Category Error:",err);
        return reply.code(500).send({
            success:false,
            message:"Internal Server Error",
            error:err.message,
        });
    }
}

