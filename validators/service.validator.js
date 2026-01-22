// validators/service.validator.js
const yup = require("yup");

// Shared small validators
const name = yup.string().trim().required("Name is required");
const email = yup.string().trim().lowercase().email("Please provide a valid email address").required("Email is required");
const phone = yup.string().trim().required("Phone is required");
const message = yup.string().trim().required("Message is required");
const SERVICE_TYPE_MAP = {
  "flight booking": "flight",
  "hotel reservation": "hotel",
  "visa service": "visa",
  "car rental": "car",
  "travel insurance": "insurance",
  "custom tours": "custom"
};


// Build schema per serviceType
const schemas = {
  flight: yup.object({
    serviceType: yup.string().required(),
    name,
    email,
    phone,
    from: yup.string().trim().required("Departure city required"),
    to: yup.string().trim().required("Destination required"),
    departureDate: yup.string().required("Departure date required"),
    returnDate: yup.string().nullable(),
    travellers: yup.number().typeError("Travellers should be a number").min(1, "At least 1 traveller").required("Travellers is required"),
    class: yup.string().nullable(),
    message: yup.string().nullable()
  }),
  visa: yup.object({
    serviceType: yup.string().required(),
    name,
    email,
    phone,
    nationality: yup.string().trim().required("Nationality is required"),
    passportNumber: yup.string().trim().required("Passport number is required"),
    travelDate: yup.string().required("Travel date is required"),
    message: yup.string().nullable()
  }),
  hotel: yup.object({
    serviceType: yup.string().required(),
    name,
    email, 
    phone,
    hotelName: yup.string().nullable(),
    checkIn: yup.string().required("Check-in date required"),
    checkOut: yup.string().required("Check-out date required"),
    rooms: yup.number().typeError("Rooms must be a number").min(1).required("Rooms required"),
    travellers: yup.number().typeError("Travellers should be a number").min(1).required("Travellers required"),
    message: yup.string().nullable()
  }),
  car: yup.object({
    serviceType: yup.string().required(),
    name,
    email,
    phone,
    pickupLocation: yup.string().required("Pickup location is required"),
    pickupDate: yup.string().required("Pickup date is required"),
    returnDate: yup.string().nullable(),
    carType: yup.string().nullable(),
    driversRequired: yup.boolean().nullable(),
    message: yup.string().nullable()
  }),
  insurance: yup.object({
    serviceType: yup.string().required(),
    name,
    email,
    phone,
    travelStart: yup.string().required("Travel start date required"),
    travelEnd: yup.string().required("Travel end date required"),
    coverage: yup.string().nullable(),
    message: yup.string().nullable()
  }),
  custom: yup.object({
    serviceType: yup.string().required(),
    name,
    email,
    phone,
    days: yup.number().typeError("Days must be a number").min(1, "Days must be at least 1").required("Total days required"),
    travellers: yup.number().typeError("Travellers must be a number").min(1).required("Travellers required"),
    message: yup.string().trim().required("Please describe your custom trip")
  })
};

function formatYupErrors(yupError) {
  const errors = {};
  if (yupError.inner && yupError.inner.length) {
    for (const err of yupError.inner) {
      if (err.path && !errors[err.path]) errors[err.path] = err.message;
    }
  } else if (yupError.path) {
    errors[yupError.path] = yupError.message;
  }
  return errors;
}

async function validateServicePayload(serviceType, payload) {
  const normalizedType = (serviceType || "").toLowerCase().trim();

  const schemaKey = SERVICE_TYPE_MAP[normalizedType];

  if (!schemaKey || !schemas[schemaKey]) {
    throw new Error("Invalid serviceType");
  }

  // 🔥 IMPORTANT: serviceType ko frontend wali value hi rehne do
  const validatedData = await schemas[schemaKey].validate(
    {
      ...payload,
      serviceType // "Flight Booking" yahin store hoga
    },
    { abortEarly: false }
  );

  return validatedData;
}


module.exports = {
  validateServicePayload,
  formatYupErrors
};
