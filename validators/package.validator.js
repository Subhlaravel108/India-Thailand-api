const yup = require("yup");
const STATUS=["Active", "Inactive"];
const createPackageSchema = yup.object({
  title: yup.string().required("Package title is required"),
  shortDescription: yup
    .string()
    .required("Short description is required"),
  imageUrl: yup.string().url("Invalid image URL").required("Image is required"),
   status: yup.string().oneOf(STATUS, `Status must be one of: ${STATUS.join(", ")}`).required("Status is required"),
});

module.exports = { createPackageSchema };
