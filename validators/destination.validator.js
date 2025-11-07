const yup=require("yup");

const STATUs=["Active","Inactive"];

exports.createDenstinationSchema=yup.object().shape({
    
    title:yup.string().trim().required("Title is required"),
    short_description:yup.string().trim().required("Short description is required"),
    description:yup.string().trim().required("Description is required"),
    meta_title:yup.string().trim().required("Meta title is required"),
    meta_description:yup.string().trim().required("Meta description is required"),
    meta_keywords:yup.string().trim().required("Meta keywords are required"),
    featured_image:yup.string().url("Image must be a valid url").required("Image is required"), // URL
    gallery:yup.array().of(yup.string().url("Each gallery item must be a valid url")).optional(),
    status:yup.string().oneOf(STATUs,`Status must be one of: ${STATUs.join(", ")}`).required("Status is required"),
});

