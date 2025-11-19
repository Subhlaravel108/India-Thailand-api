const yup = require("yup");

exports.createFeedbackSchema = yup.object().shape({
  name: yup.string().trim().required("Name is required"),
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Please provide a valid email address")
    .required("Email is required"),
  phone: yup
    .string()
    .trim()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .nullable(),
  profile_image: yup.string().nullable(),
  rating: yup
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5")
    .required("Rating is required"),
  message: yup.string().trim().required("Message is required"),
});
