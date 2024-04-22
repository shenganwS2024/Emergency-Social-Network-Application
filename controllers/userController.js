import mongoose from 'mongoose'
import {findAllUsers, Users, privilegeChangeCheck} from '../models/Users.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { io } from '../config/serverConfig.js'
import {userRoomMap} from '../config/globalVariables.js'
// import reservedUsernames from '../views/bannedUsernames.json' ;
import reservedUsernames from '../views/bannedUsernames.json' assert { type: 'json' };



async function validateUserInfo(username, password) {
  let bannedUsernames = reservedUsernames.reservedUsernames;

  username = username.toLowerCase();

  if (username.length < 3 || bannedUsernames.includes(username)) {
    return false;
  } else if (password.length < 4) {
    return false;
  } else {
    return true;
  }
}

async function findUserByUsername(username) {
  return await Users.findOne({ username });
}

async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

async function generateToken(userId, username) {
  return jwt.sign(
    {
      userId,
      username,
    },
    'fsesb2secretkey',
    { expiresIn: '1h' },
  );
}

async function getUsers() {
  return await Users.find({});
}

async function checkUserCredentials(username, password, userFound) {
  if (!userFound) {
    return { isValid: false, reason: 'New Account', statusCode: 201 };
  }

  if (userFound.activeness === false) {
    return { isValid: false, reason: 'Inactive user', statusCode: 403 };
  }

  const isMatch = await comparePassword(password, userFound.password);
  if (!isMatch) {
    return { isValid: false, reason: 'Authentication failed', statusCode: 401 };
  }

  return { isValid: true };
}

async function prepareUserData(userFound) {
  const token = await generateToken(userFound.id, userFound.username);
  const directory = await getUsers();

  return {
    token: token,
    userID: userFound.id,
    username: userFound.username,
    users: directory,
    acknowledged: userFound.acknowledged,
  };
}

async function validateUser(req, res) {
  try {
    const { username, password } = req.body;
    const userFound = await findUserByUsername(username);
    const credentialCheck = await checkUserCredentials(username, password, userFound);

    if (!credentialCheck.isValid) {
      console.log(credentialCheck.reason);
      return res.status(credentialCheck.statusCode).send(credentialCheck.reason);
    }

    console.log('Password is correct!');
    const userData = await prepareUserData(userFound);
    
    return res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('Error during validation: ', error);
    return res.status(500).send('Error during validation');
  }
}

async function validateAndCreateUser(username, password) {
  if (!(await validateUserInfo(username, password))) {
    throw new Error('Invalid username or password');
  }
  const user = new Users({ username, password});
  await user.save();
  return user;
}

async function createJwtToken(user) {
  try {
    return jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      'fsesb2secretkey',
      { expiresIn: '1h' },
    );
  } catch (err) {
    console.log(err);
    throw new Error('Error creating token');
  }
}

async function registerUser(req, res) {
  try {
    const { username, password} = req.body;
    const user = await validateAndCreateUser(username, password);
    const token = await createJwtToken(user);

    res.status(201).json({ data: { token: token, userID: user.id } });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}


async function logoutUser(req, res) {
  try {
    const { id, status } = req.body //online_status
    const userFound = await Users.findById(id)
    if (userFound) {
      //updateUserStatus(userFound, false)
      res.status(200).send('User logs out successfully')
    } else {
      res.status(404).send('User not found during logout')
    }
  } catch (error) {
    res.status(500).send('Error logout')
  }
}

async function acknowledgeUser(userFound) {
  if (!userFound) {
    return { success: false, message: 'User not found during acknowledgement', statusCode: 404 };
  }

  userFound.acknowledged = true;
  await userFound.save();
  return { success: true, message: 'User acknowledged successfully', statusCode: 200 };
}

async function UserAcknowledged(req, res) {
  try {
    const { id } = req.body;
    const userFound = await Users.findById(id);

    const result = await acknowledgeUser(userFound);

    if (!result.success) {
      return res.status(result.statusCode).send(result.message);
    }

    res.status(result.statusCode).send(result.message);
  } catch (error) {
    console.error('Error in UserAcknowledged:', error);
    res.status(500).send('Error acknowledgement');
  }
}


function extractLatestStatusforUsers(userObj) {
  if (userObj.status && userObj.status.length > 0) {
    const latestStatus = userObj.status.sort((a, b) => new Date(b.date) - new Date(a.date))[0].status;
    userObj.status = latestStatus;
  } else {
    userObj.status = 'undefined';
  }
  return userObj;
}

function serializeChatChecked(userObj) {
  if (userObj.chatChecked && userObj.chatChecked instanceof Map) {
    userObj.chatChecked = Array.from(userObj.chatChecked).reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
  }
  return userObj;
}

function convertToUserObject(user) {
  let userObj;
  if (user instanceof mongoose.Document) {
    userObj = user.toObject({ getters: true, virtuals: false });
  } else {
    userObj = user;
  }
  return userObj;
}

async function getUser(req, res) {
  try {
    let directory = await findAllUsers();

    directory = directory.map(user => {
      let userObj = convertToUserObject(user);
      userObj = extractLatestStatusforUsers(userObj);
      return userObj;
    });

    directory = directory.map(serializeChatChecked);
    
    console.log("current directory", directory);
    res.status(200).json({ data: { users: directory } });
  } catch (error) {
    console.error(error);
    res.status(500).send('Users get server error');
  }
}


function extractLatestStatus(statuses) {
  return statuses.sort((a, b) => b.date - a.date)[0];
}

async function getOneStatus(req, res) {
  try {
    let user = await Users.findOne({ username: req.params.username }, 'status');

    if (!user || !user.status || user.status.length === 0) {
      return res.status(404).json({ message: 'User or user status not found' });
    }

    let latestStatus = extractLatestStatus(user.status);

    res.status(200).json({ data: { status: latestStatus.status } });
  } catch (error) {
    console.error(error);
    res.status(500).send('User status get server error');
  }
}


function updateStatusList(statuses, newStatus) {
  statuses.push({ status: newStatus, date: new Date() });
  if (statuses.length > 10) {
    statuses.shift();
  }
}

async function updateOneStatus(req, res) {
  try {
    const { status } = req.body;
    const username = req.params.username;
    const userFound = await Users.findOne({ username: username });

    if (!userFound) {
      return res.status(404).send('User not found');
    }

    updateStatusList(userFound.status, status);
    io.emit('update status', { username: username, status: status });
    if (status === 'emergency') {
      io.emit('emergency', { username: username });
    }
    await userFound.save();
    res.status(200).send('User status update successful');
  } catch (error) {
    console.error(error);
    res.status(500).send('User status update server error');
  }
}


async function updateChatChecked(req, res) {
  try {
    const { active_username, passive_username, join_or_leave } = req.params;
    const roomName = getRoomName(active_username, passive_username);

    if (join_or_leave === 'join') {
      await handleUserJoin(roomName, active_username, passive_username);
    } else {
      handleUserLeave(roomName, active_username);
    }

    res.status(200).send('User chatChecked update successful');
  } catch (error) {
    console.error("update check error: ", error);
    res.status(500).send('User status update server error');
  }
}

function getRoomName(activeUser, passiveUser) {
  return [activeUser, passiveUser].sort().join('_');
}

async function handleUserJoin(roomName, activeUser, passiveUser) {
  console.log(`${activeUser} joined room ${roomName}`);
  if (!userRoomMap[roomName]) {
    userRoomMap[roomName] = [];
  }
  userRoomMap[roomName].push(activeUser);
  const newValue = true;
  await updateUserChatChecked(activeUser, roomName, newValue, passiveUser);
}

function handleUserLeave(roomName, activeUser) {
  console.log(`${activeUser} left room ${roomName}`);
  let users = userRoomMap[roomName];
  if (users && users.includes(activeUser)) {
    users.splice(users.indexOf(activeUser), 1);
    console.log(`User ${activeUser} left private room ${roomName}`);
    if (users.length === 0) {
      delete userRoomMap[roomName];
    }
  }
}

async function updateUserChatChecked(username, roomName, newValue, passiveUser) {
  try {
    await Users.findOneAndUpdate(
      { username },
      { $set: { [`chatChecked.${roomName}`]: newValue }},
      { new: true }
    );
    io.emit("alertUpdated", { sender: username, receiver: passiveUser, checked: newValue });
  } catch (error) {
    console.error('Error updating the document:', error);
  }
}

async function updateProfile(req, res) {
  try {
    const { new_username, password, activeness, privilege } = req.body;
    const username = req.params.username;
    const userFound = await Users.findOne({ username: username });

    if (!userFound) {
      return res.status(404).send('User not found');
    }

    if (new_username !== undefined ) {
      //update userFound's username and save it to DB
      userFound.username = new_username;
      io.emit('changeUsername', { username: username, new_username: new_username });
    }
    else if (password !== undefined ) {
      //update userFound's password and save it to DB
      userFound.password = password;
    }
    else if (activeness !== undefined ) {
      //update userFound's activenss and save it to DB
      userFound.activeness = activeness;
      io.emit('changeActiveness', { username: username, activeness: activeness });
    }
    else if (privilege !== undefined ) {
      //update userFound's privilege and save it to DB
      let canChange = await privilegeChangeCheck(username, privilege);
      if (canChange === true) {
        userFound.privilege = privilege;
      }
      else {
        return res.status(500).send('Attempt to change the privilege of the last administrator');
      }
    }
    else {
      return res.status(500).send('Attempt to update profile with invalid field');
    }
    await userFound.save();
    res.status(200).send('User profile update successful');
  } catch (error) {
    console.error("update profile error: ", error);
    res.status(500).send('User profile update server error');
  }
}

// add a helper function to call updateProfile in the userController but the user's privilege level is administrator
async function updateProfileByAdmin(req, res) {
  try {
    const username = req.params.username;
    const userFound = await Users.findOne({ username: username });

    if (userFound.privilege !== 'Administrator') {
      return res.status(403).send('User does not have the privilege to update profile');
    }
    else {
      updateProfile(req, res);
    }

  }
  catch (error) {
    console.error("update profile error: ", error);
    res.status(500).send('User profile update server error');
  }

}

  export { validateUser, registerUser, logoutUser, UserAcknowledged, getUser, validateUserInfo, getOneStatus, updateOneStatus, updateChatChecked, updateProfile, updateProfileByAdmin};
