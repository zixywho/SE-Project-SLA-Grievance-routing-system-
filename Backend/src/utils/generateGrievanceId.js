import { Counter } from "../models/counter.model.js";

export const generateGrievanceId = async () => {
  const c = await Counter.findOneAndUpdate(
    { _id: "grievance" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return "GRV-" + String(c.seq).padStart(4, "0");
};