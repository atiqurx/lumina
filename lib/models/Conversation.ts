// models/Conversation.ts
import { Schema, model, models } from 'mongoose';

const ConversationSchema = new Schema({
  history: [
    {
      role:      { type: String, enum: ['user','bot'], required: true },
      message:   { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

export default models.Conversation || model('Conversation', ConversationSchema);
