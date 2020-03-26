import { Schema, model } from 'mongoose';

const teamLeadSchema = new Schema({
  teamUniqueId: String,
  creator: String,
  start: String,
  stop: String,
  createdAt: String,
  updatedAt: String,
})

export const TeamLead = model('TeamLead', teamLeadSchema);
