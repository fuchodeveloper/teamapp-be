import { Schema, model }  from 'mongoose';

const teamSchema = new Schema({
  name: String,
  uniqueId: String,
  duties: String,
  lead: String,
  creator: { type: String, required: true },
}, { timestamps: true })

export const Team = model('Team', teamSchema);
