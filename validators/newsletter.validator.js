// validators/newsletter.validator.js
const yup = require("yup");

const subscribeSchema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Please provide a valid email address")
    .required("Email is required"),
});

module.exports = { subscribeSchema };
