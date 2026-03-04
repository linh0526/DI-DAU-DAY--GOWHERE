import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String }, // Optional for social login
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Location' }]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
