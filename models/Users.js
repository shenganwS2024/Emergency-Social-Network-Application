import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const statusEntrySchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date }
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  onlineStatus: { type: Boolean, default: false },
  status: {
    type: [statusEntrySchema],
    default: [{ status: 'undefined', date: new Date() }],
    validate: [arrayLimit, '{PATH} exceeds the limit of 10']
  },
  role: String,
  acknowledged: { type: Boolean, default: false },
  chatChecked: { type: Map, of: Boolean },
  address: String,
  contact:  {
    emergency: [{
      type: String, // Assuming references to other User documents
    }],
    primary: [{
      type: String, // Assuming references to other User documents
    }]
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  next();
});

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

function arrayLimit(val) {
  return val.length <= 10;
}

const Users = mongoose.model('Users', userSchema);

async function findAllUsers() {
  try {
    return await Users.find({});
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

async function findStatuses(username) {
  try {
    const user = await Users.findOne({ username });
    if (!user) {
      throw new Error(`User ${username} not found.`);
    }
    return user.status;
  } catch (error) {
    console.error("Error fetching user status:", error);
    throw error;
  }
}

export { findAllUsers, Users, findStatuses };
