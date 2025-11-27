// validators/tour.validator.js
const yup = require("yup");

// const HOTEL_TYPES = ["1 Star", "2 Star", "3 Star", "4 Star", "5 Star"];
const STATUS=["Active","Inactive"]
const itineraryItemSchema = yup.object({
  title: yup.string().required("Itinerary item title is required"),
  detail: yup.string().required("Itinerary item detail is required"),
});

const createTourSchema = yup.object({
  title: yup.string().trim().required("Title is required"),
    meta_title: yup.string().trim().required("Meta title is required"),
  meta_description: yup.string().trim().required("Meta description is required"),
  meta_keywords: yup.string().trim().required("Meta keywords are required"),
  itinerary: yup
    .array()
    .of(itineraryItemSchema)
    .min(1, "Itinerary must have at least one day")
    .required("Itinerary is required"),
  shortDescription: yup.string().trim().required("Short description is required"),
  description: yup.string().trim().required("Description is required"),
  featureImage: yup.string().url("Feature image must be a valid URL").required("Feature image is required"),
  gallery: yup
    .array()
    .of(yup.string().url("Gallery images must be valid URLs"))
    .min(1, "At least one gallery image is required")
    .required("Gallery images are required"),
  tour_duration: yup.string().trim().required("Tour duration is required"),
  price: yup.number().min(0, "Price must be 0 or more").nullable(),
  // nights: yup.number().integer().min(0, "Nights must be 0 or more").required("Nights is required"),
  people: yup.string().required("People is required"),
  countries: yup.string().trim().required("Countries is required"),
  hotelType: yup.string().trim().required("Hotel type is required"),
  travelInsuranceIncluded: yup.boolean().required("travelInsuranceIncluded is required (true/false)"),
  included: yup
    .array()
    .of(yup.string().trim().required())
    .min(1, "Included must have at least one item")
    .required("Included is required"),
  notIncluded: yup
    .array()
    .of(yup.string().trim())
    .notRequired(),
  packageId: yup.string().trim().required("packageId is required"),
    destinationIds: yup
    .array()
    .of(yup.string().trim().required("Each destinationId is required"))
    .min(1, "At least one destinationId is required")
    .required("DestinationIds field is required"),
  status:yup.string().oneOf(STATUS,`Status must be one of: ${STATUS.join(", ")}`).required("Status is required")
});

module.exports = { createTourSchema };
