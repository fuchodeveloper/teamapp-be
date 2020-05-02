import { Schema, model, Document, Model } from 'mongoose';

export interface ITeamUser extends Document {
  insert: Function;
  find: Function;
  insertMany: Function;
}

const teamUserSchema = new Schema<ITeamUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    teamUniqueId: { type: String, required: true },
  },
  { timestamps: true },
);

export const TeamUser = model<ITeamUser>('TeamUser', teamUserSchema);
