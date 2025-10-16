import Receptionist from "../models/ReceptionistModel.js";
import bcrypt from "bcryptjs";

// List all receptionists
export const listReceptionistsService = () => Receptionist.find().sort({ createdAt: -1 });

// Get single receptionist
export const getReceptionistByIdService = (id) => Receptionist.findById(id);

// Create receptionist
export const createReceptionistService = async (data) => {
  const receptionist = new Receptionist(data);
  return receptionist.save();
};

// Update receptionist details (admin can change password too)
export const updateReceptionistService = async (id, data) => {
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
  }
  return Receptionist.findByIdAndUpdate(id, data, { new: true });
};

// Delete receptionist
export const deleteReceptionistService = (id) => Receptionist.findByIdAndDelete(id);
