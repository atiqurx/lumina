// models/DegreePlan.ts
import { Schema, model, models, Types } from 'mongoose';

const DegreePlanSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true },
  sems: [
    {
      semNumber: Number,
      courses:   [String], 
    },
  ],
});

export default models.DegreePlan || model('DegreePlan', DegreePlanSchema);
