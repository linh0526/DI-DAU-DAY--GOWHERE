import mongoose, { Schema } from 'mongoose';

const LocationSchema = new Schema({
    name: { type: String, required: true },
    city: { type: String, required: true, default: 'hanoi' },
    district: { type: String, default: '' },
    address: { type: String, required: true },
    coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    },
    googleMapsUrl: String,
    phoneNumber: String,
    facebookUrl: String,
    website: String,
    openingHours: {
        open: { type: String, default: '08:00' },
        close: { type: String, default: '22:00' }
    },
    menu: [{
        name: String,
        price: Number,
        image: String
    }],
    priceSegment: { type: String, default: '' },
    tags: [{ type: String }],
    note: String,
    description: String,
    image: String,
    images: [{ type: String }], // For image moderation flow
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'closed', 'maintenance'], 
        default: 'active' 
    },
    upvotes: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    feedback: [{
        user: String,
        comment: String,
        rating: Number,
        isHidden: { type: Boolean, default: false }, // For moderation
        date: { type: Date, default: Date.now }
    }],
    reports: [{
        user: String,
        reason: String,
        status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.models.Location || mongoose.model('Location', LocationSchema);
