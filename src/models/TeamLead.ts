import { Schema, model } from 'mongoose';

const teamLeadSchema = new Schema({
  teamUniqueId: { type: String, required: true },
  creator: String,
  start: String,
  stop: String,
}, { timestamps: true })

export const TeamLead = model('TeamLead', teamLeadSchema);
