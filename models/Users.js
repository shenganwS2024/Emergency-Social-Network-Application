import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const statusEntrySchema = new mongoose.Schema({
  status: { type: String, required: true},
  date: { type: Date}
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  onlineStatus: {
    type: Boolean,
    default: false,
  },
  status: {
    type: [statusEntrySchema],
    default: [{ status: 'undefined', date: new Date() }],  // Default entry for status
    validate: [arrayLimit, '{PATH} exceeds the limit of 10']
  },
  role: String,
  acknowledged: {
    type: Boolean,
    default: false,
  },
  //chatChecked: {user1_user2: True, user1_user4: False}
  //const roomName = [sender, receiver].sort().join('_');
  chatChecked: {
    type: Map,
    of: Boolean, 
  },
})

function arrayLimit(val) {
  return val.length <= 10;
}

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

let Users = mongoose.model('Users', userSchema)

async function findAllUsers() {
  try {
      const users = await Users.find({});
      return users;
  } catch (error) {
      // Handle or throw the error according to your application's needs
      console.error("Error fetching users:", error);
      throw error;
  }
}

async function findStatuses(username) {
  try {
    const user = await Users.findOne({ username: username });
    if (!user) {
      throw new Error(`User ${username} not found.`);
    }

    const latestStatuses = user.status;

    return latestStatuses
  } catch (error) {
    console.error("Error fetching user status:", error);
    throw error;
  }
}


export { findAllUsers, Users, findStatuses };

