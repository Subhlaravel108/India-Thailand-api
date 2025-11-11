const yup = require("yup");

exports.createBookingSchema = yup.object().shape({
  fullName: yup.string().required("Full name is required"),
  email: yup.string().email("Enter valid email").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  destination: yup.string().required("Please select a destination"),
  packageType: yup.string().required("Please select a package type"),
  travelers: yup.number().required("Number of travelers is required").min(1, "At least 1 traveler"),
  travelDate: yup.string().required("Please select a travel date"),
  message: yup.string().nullable(),
});

// Helper for showing errors field-wise
exports.formatYupErrors = (error) => {
  const errors = {};
  error.inner.forEach((e) => {
    errors[e.path] = e.message;
  });
  return errors;
};
