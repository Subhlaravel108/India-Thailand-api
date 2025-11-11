const yup = require("yup");

const createContactSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
  lastname: yup.string().trim().required("Lastname is required"),
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Please provide a valid email address")
    .required("Email is required"),
  phone: yup
    .string()
    .matches(/^(\+91|91)?[6-9]\d{9}$/, "Please provide a valid Indian phone number")
    .required("Phone is required"),
  travelInterest: yup.string().trim().required("Please select travel interest"),
  message: yup.string().trim().required("Message is required"),
});

module.exports = { createContactSchema };
