import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  receiverUsername: {
    type: String,
    required: true,
  },
  senderUsername: {
    type: String,
    required: true,
  },
  resourceNeedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResourceNeeds',
    required: true,
  },
  offeredQuantity: {
    type: Number,
    required: true,
  },
  resourceType: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// a function that could delete a specific notification
notificationSchema.statics.deleteNotification = async function (notificationId) {
  try {
    return await this.deleteOne({ _id: notificationId });
  } catch (error) {
    throw error;
  }
};

export const Notification = mongoose.model('Notification', notificationSchema);
