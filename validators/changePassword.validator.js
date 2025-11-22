const yup = require("yup");

exports.changePasswordSchema = yup.object().shape({
  current_password: yup
    .string()
    .required("Current password is required"),

  new_password: yup
    .string()
    .min(6, "New password must be at least 6 characters")
    .required("New password is required"),

  new_password_confirmation: yup
    .string()
    .oneOf([yup.ref("new_password"), null], "Passwords must match")
    .required("Password confirmation is required")
});
