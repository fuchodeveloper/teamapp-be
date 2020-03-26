import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: String,
  team: String,
  role: String,
  email: String
}, { timestamps: true });

export const User = model('User', userSchema);
