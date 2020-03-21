import mongoose  from 'mongoose';

// @ts-ignore 
export const Team = mongoose.model('Team', { name: String });