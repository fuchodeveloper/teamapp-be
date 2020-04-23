import { Schema, model } from 'mongoose';

const teamLeadSchema = new Schema(
  {
    teamUniqueId: { type: String, required: true },
    creator: { type: String, required: true },
    start: { type: String, required: true },
    stop: String,
    userId: { type: String, required: true },
  },
  { timestamps: true },
);

export const TeamLead = model('TeamLead', teamLeadSchema);
