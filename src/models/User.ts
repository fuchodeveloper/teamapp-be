import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: String,
    team: String,
    role: String,
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const User = model('User', userSchema);
