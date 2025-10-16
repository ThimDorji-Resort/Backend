import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ReceptionistSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
    name: { type: String, required: true },
    email: { type: String, default: "" },
  },
  { timestamps: true }
);

// Hash password before save
ReceptionistSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
ReceptionistSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const Receptionist = mongoose.model("Receptionist", ReceptionistSchema);
export default Receptionist;
