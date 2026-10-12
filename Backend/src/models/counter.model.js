import mongoose, { Schema } from "mongoose";

const counterSchema = new Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model("Counter", counterSchema);