import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  facultyId: String,
  personalProfile: Object,
  previousExperience: Array,
  administrativeRoles: Array,
  teachingWorkload: Array,
  fdpEntries: Array,
  publications: Array,
  patents: Array,
  researchProjects: Array,
  phdScholars: Array,
  status: { type: String, default: "draft" }
}, { timestamps: true });

export default mongoose.model("Application", applicationSchema);