import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  employeeId: String,
  password: String,
  role: { type: String, enum: ["admin", "faculty"], default: "faculty" }
});

export default mongoose.model("User", userSchema);