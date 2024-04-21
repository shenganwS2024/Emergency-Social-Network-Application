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
  activeness: { type: Boolean, default: true },
  privilege: { type: String, default: "Citizen" },
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

async function privilegeChangeCheck(username, privilege) {
  try {
    const user = await Users.findOne({ username });
    if (!user) {
      throw new Error(`User ${username} not found.`);
    }
    //check if the user is the last admin in the system
    if (user.privilege === 'Administrator' && privilege !== 'Administrator') {
      // Count how many administrators are currently in the system
      const adminCount = await Users.countDocuments({ privilege: 'Administrator' });
      if (adminCount === 1) { // Check if this user is the last administrator
        console.log('Cannot change privilege: User is the last administrator.');
        return false; // Return false, indicating the privilege cannot be changed
      }
    }

    return true;
  } catch (error) {
    console.error("Error in privilege change checking:", error);
    throw error;
  }
}

export { findAllUsers, Users, findStatuses, privilegeChangeCheck };
