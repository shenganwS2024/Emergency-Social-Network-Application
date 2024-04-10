import mongoose from 'mongoose';
import { Users } from '../models/Users.js';

const resourceNeedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', 
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  resourceType: {
    type: String,
    enum: ['Food', 'Water', 'Medicine', 'Shelter', 'Clothing', 'Other'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  urgencyLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true,
  },
  progress: {
    type: Number,
    default: 0, 
    min: 0,
    max: 100
  },
  totalQuantityNeeded: {
    type: Number,
    required: true,
    min: 1
  },
  quantityFulfilled: {
    type: Number,
    default: 0,
    min: 0
  },
  otherResourceType: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

resourceNeedSchema.virtual('progressPercentage').get(function() {
  return (this.quantityFulfilled / this.totalQuantityNeeded) * 100;
});

async function findAllResourceNeeds() {
  try {
    return await ResourceNeeds.aggregate([
      {
        $addFields: {
          urgencySortOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$urgencyLevel", "Low"] }, then: 3 },
                { case: { $eq: ["$urgencyLevel", "Medium"] }, then: 2 },
                { case: { $eq: ["$urgencyLevel", "High"] }, then: 1 }
              ],
              default: 0 
            }
          }
        }
      },
      { $sort: { urgencySortOrder: 1 } }
    ]);
  } catch (error) {
    console.error("Error fetching resource needs:", error);
    throw error;
  }
}

async function findUsernameById(userId) {
  try {
    const user = await Users.findById(userId);
    return user.username;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export const ResourceNeeds = mongoose.model('ResourceNeeds', resourceNeedSchema);
export { findAllResourceNeeds, findUsernameById };
