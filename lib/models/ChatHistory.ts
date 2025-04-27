// models/ChatHistory.ts
import { Schema, model, models, Types } from 'mongoose';

const ChatHistorySchema = new Schema({
  user:   { type: Types.ObjectId, ref: 'User', required: true },
  convos: [{ type: Types.ObjectId, ref: 'Conversation' }],
  updatedAt: { type: Date, default: Date.now },
});

export default models.ChatHistory || model('ChatHistory', ChatHistorySchema);
