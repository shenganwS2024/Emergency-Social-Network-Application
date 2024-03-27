import mongoose from 'mongoose'
import {findAllUsers, Users} from '../models/Users.js';
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

async function validateUser(req, res) {
  try {
    const { username, password } = req.body;

    const userFound = await findUserByUsername(username);

    if (userFound) {
      const isMatch = await comparePassword(password, userFound.password);

      if (isMatch) {
        console.log('Password is correct!');

        const token = await generateToken(userFound.id, userFound.username);
        const directory = await getUsers();

        return res.status(200).json({
          success: true,
          data: {
            userID: userFound.id,
            username: userFound.username,
            token,
            users: directory,
            acknowledged: userFound.acknowledged,
          },
        });
      } else {
        console.log('Password is incorrect.');
        return res.status(401).send('Authentication failed');
      }
    } else {
      return res.status(201).send('New Account');
    }
  } catch (error) {
    return res.status(500).send('Error during validation');
  }
}

async function registerUser(req, res) {
  try {
    const { username, password, status, role } = req.body
    if(await validateUserInfo(username, password) === false) {
      return res.status(500).send('Invalid username or password')
    }
    const user = new Users({ username, password, status, role })
    await user.save()
    let token
    try {
      //Creating jwt token
      token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
        },
        'fsesb2secretkey',
        { expiresIn: '1h' },
      )
      console.log('register true token', token)
    } catch (err) {
      console.log(err)
      return res.status(500).send('Error creating token')
    }
    res.status(201).json({ data: { token: token, userID: user.id } })
  } catch (error) {
    res.status(500).send('Error registering new user')
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

async function UserAcknowledged(req, res) {
  try {
    const { id } = req.body //online_status
    const userFound = await Users.findById(id)
    if (userFound) {
      try {
        userFound.acknowledged = true
        await userFound.save()
      } catch (error) {
        throw error
      }
      res.status(200).send('User acknowledged successfully')
    } else {
      res.status(404).send('User not found during acknowledgement')
    }
  } catch (error) {
    res.status(500).send('Error acknowledgement')
  }
}

async function getUser(req, res) {
  try {
    let directory = await findAllUsers();

    directory = directory.map(user => {
      const userObj = user.toObject({ getters: true, virtuals: false });
    
      // Directly modify the userObj's status
      if (userObj.status && userObj.status.length > 0) {
        const latestStatus = userObj.status.sort((a, b) => new Date(b.date) - new Date(a.date))[0].status;
        userObj.status = latestStatus;
      } else {
        userObj.status = 'undefined';
      }
    
      return userObj;
    });
    
    directory = directory.map(user => {
      let userObj;
    
      // Check if the user is a Mongoose document and convert it accordingly
      if (user instanceof mongoose.Document) {
        userObj = user.toObject({ getters: true, virtuals: false });
      } else {
        // If it's not a Mongoose document, handle it directly
        userObj = user;
      }
    
      // Ensure the chatChecked field is serialized properly
      if (userObj.chatChecked && userObj.chatChecked instanceof Map) {
        userObj.chatChecked = Array.from(userObj.chatChecked).reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
      }
    
      return userObj;
    });
    
    
    console.log("current directory", directory)
    res.status(200).json({ data: { users: directory } })
  } catch (error) {
    console.error(error)
    res.status(500).send('Users get server error')
  }
}

async function getOneStatus(req, res) {
  try {
    let user = await Users.findOne({ username: req.params.username }, 'status');

    if (!user || !user.status || user.status.length === 0) {
      return res.status(404).json({ message: 'User or user status not found' });
    }

    // Sort the status array by date in descending order to get the latest status first
    let latestStatus = user.status.sort((a, b) => b.date - a.date)[0];
    console.log("stats ", latestStatus.status)
    // Send the latest status
    res.status(200).json({ data: { status: latestStatus.status} });
  } catch (error) {
    console.error(error)
    res.status(500).send('User status get server error')
  }
}

async function updateOneStatus(req, res) {
  try {
    const { status } = req.body
    const username = req.params.username;
    const userFound = await Users.findOne({ username: username })
    if (!userFound) {
      return res.status(404).send('User not found');
    }

    userFound.status.push({ status: status, date: new Date() });
    if (userFound.status.length > 10) {
      userFound.status.shift();
    }
    io.emit('update status', { username: username, status: status })
    await userFound.save()
    res.status(200).send('User status update successful')
  } catch (error) {
    console.error(error)
    res.status(500).send('User status update server error')
  }
}

async function updateChatChecked(req, res) {
  try {
    let active_user = req.params.active_username;
    let passive_user = req.params.passive_username;
    let join_or_leave = req.params.join_or_leave;
    const roomName = [active_user, passive_user].sort().join('_');
    if (join_or_leave === 'join') {
      console.log(`${active_user} joined room ${roomName}`);
      if (!userRoomMap[roomName]) {
        //userRoomMap example: userRoomMap: {userA_userB: [userA,userB], userA_userC: [userC]}
        userRoomMap[roomName] = [];
      }
      userRoomMap[roomName].push(active_user);
      const newValue = true;
      Users.findOneAndUpdate(
        { username: active_user },
        { $set: { [`chatChecked.${roomName}`]: newValue }}, 
        { new: true }
      ).then(updatedDocument => {
        io.emit("alertUpdated", {sender: active_user, receiver:passive_user, checked: newValue});
        
      }).catch(error => {
        console.error('Error updating the document:', error);
      });
    }
    else{
      console.log(`${active_user} left room ${roomName}`);
      let users = userRoomMap[roomName];
      if (users && users.includes(active_user)) {
        users.splice(users.indexOf(active_user), 1);
        console.log(`User ${active_user} left private room ${roomName}`)
        if (users.length === 0) {
          delete userRoomMap[roomName];
        }
      }
    }
    console.log("current userRoomMap: ",userRoomMap)
    res.status(200).send('User chatChecked update successful')
  } catch (error) {
    console.log("update check error")
    console.error(error)
    res.status(500).send('User status update server error')
  }
}

  export { validateUser, registerUser, logoutUser, UserAcknowledged, getUser, validateUserInfo, getOneStatus, updateOneStatus, updateChatChecked};
