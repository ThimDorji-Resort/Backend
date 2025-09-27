import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "hotel/facilities",
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  }),
});

export const uploadImage = multer({ storage });
