import mongoose from 'mongoose';

const DistrictSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true }
});

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  order: { type: Number, default: 0 },
  districts: [DistrictSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.City || mongoose.model('City', CitySchema);
