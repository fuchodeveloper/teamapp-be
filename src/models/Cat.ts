import mongoose  from 'mongoose';
// @ts-ignore 
export const Cat = mongoose.model('Cat', { name: String });
