const yup = require("yup");

export const userSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .required("Name is required"),

  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Please provide a valid email address")
    .required("Email is required"),

  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),

  phone: yup
    .string()
    .matches(/^(\+91|91)?[6-9]\d{9}$/, "Please provide a valid Indian phone number")
    .required("Phone number is required"),

  status: yup
    .string()
    .oneOf(["Active", "Inactive"], "Status must be either 'Active' or 'Inactive'")
    .required("Status is required"),
});
