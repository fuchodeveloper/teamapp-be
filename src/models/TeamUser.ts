import { Schema, model, Document, Model } from 'mongoose';

export interface ITeamUser extends Document {
  insertMany: Function;
}

const teamUserSchema = new Schema<ITeamUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    team: { type: String, required: true },
  },
  { timestamps: true },
);

export const TeamUser = model<ITeamUser>('TeamUser', teamUserSchema);
