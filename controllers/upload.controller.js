const cloudinary = require("../utils/cloudinary");

const uploadImage = async (req, reply) => {
  try {
    const data = await req.file();

    if (!data) {
      return reply.code(400).send({
        success: false,
        message: "Image file is required!"
      });
    }

    const fileBuffer = await data.toBuffer();

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "tours_app_uploads" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      stream.end(fileBuffer);
    });

    return reply.code(200).send({
      success: true,
      message: "Image uploaded successfully ✅",
      imageUrl: result.secure_url
    });

  } catch (error) {
    console.error("Cloudinary Error:", error);

    return reply.code(500).send({
      success: false,
      message: "Internal Server Error ❌",
      error: error.message
    });
  }
};

module.exports = { uploadImage };
