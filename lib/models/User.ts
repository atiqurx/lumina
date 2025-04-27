// models/User.ts
import { Schema, model, models, Types } from 'mongoose';

const UserSchema = new Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },   // ← new
  major:      { type: String, required: true },
  degree:     { type: String, enum: ['bachelor','master','phd'], required: true },
  chatHistory:{ type: Types.ObjectId, ref: 'ChatHistory' },
  degreePlan: { type: Types.ObjectId, ref: 'DegreePlan' },
}, { timestamps: true });

export default models.User || model('User', UserSchema);
