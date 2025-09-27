import mongoose from "mongoose";

const FacilitySchema = new mongoose.Schema(
  {
    image: { type: String, default: "" }, // Cloudinary secure URL or any URL
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    description: { type: String, default: "", maxlength: 2000 },
  },
  { timestamps: true }
);

FacilitySchema.index({ title: 1 }, { unique: true });

const Facility = mongoose.model("Facility", FacilitySchema);
export default Facility;
