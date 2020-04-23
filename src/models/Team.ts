import { Schema, model }  from 'mongoose';

const teamSchema = new Schema(
  {
    name: { type: String, required: true },
    uniqueId: { type: String, required: true },
    duties: { type: String, maxlength: 3000 },
    lead: String,
    creator: { type: String, required: true },
  },
  { timestamps: true },
);

export const Team = model('Team', teamSchema);
