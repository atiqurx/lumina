import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDegreePlan extends Document {
  user: string; // ← now a string
  sems: {
    semNumber: number;
    courses: string[];
  }[];
}

const DegreePlanSchema = new Schema<IDegreePlan>(
  {
    user: { type: String, required: true }, // ← string, not ObjectId
    sems: [
      {
        semNumber: { type: Number, required: true },
        courses: { type: [String], required: true },
      },
    ],
  },
  {
    collection: "degree-planners",
    timestamps: true,
  }
);

const DegreePlan: Model<IDegreePlan> =
  mongoose.models.DegreePlan ||
  mongoose.model<IDegreePlan>("DegreePlan", DegreePlanSchema);

export default DegreePlan;
