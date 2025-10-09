import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" }, // Cloudinary secure URL or any URL
    name: { type: String, required: true },
    stay: { type: String, required: true },
    testimonial: { type: String, required: true },
    archived: { type: Boolean, default: false } // new archive field
  },
  { timestamps: true }
);

TestimonialSchema.index({ archived: 1 });

const Testimonial = mongoose.model("Testimonial", TestimonialSchema);
export default Testimonial;
