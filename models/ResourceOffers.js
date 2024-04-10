import mongoose from 'mongoose';

const resourceOfferSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  resourceType: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  dateOffered: {
    type: Date,
    default: Date.now,
  },
});

export const ResourceOffers = mongoose.model('ResourceOffers', resourceOfferSchema);
