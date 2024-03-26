
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


async function validateUser(req, res) {
  try {
    const { username, password, status, role } = req.body
    // Check for existing user
    const userFound = await Users.findOne({ username })
    if (userFound) {
      const isMatch = await bcrypt.compare(password, userFound.password)

      if (isMatch) {
        console.log('Password is correct!')
        // Update user status to online
        // await updateUserStatus(userFound, true);
        let token
        try {
          //Creating jwt token
          token = jwt.sign(
            {
              userId: userFound.id,
              username: userFound.username,
            },
            'fsesb2secretkey',
            { expiresIn: '1h' },
          )
          console.log('login true token', token)
        } catch (err) {
          console.log(err)
          return res.status(500).send('Error creating token')
        }

        let directory
        try {
          directory = await Users.find({})
        } catch (error) {
          console.error(error)
          res.status(500).send('Users post server error')
        }

        return res.status(200).json({
          success: true,
          data: {
            userID: userFound.id,
            username: userFound.username,
            token: token,
            users: directory,
            acknowledged: userFound.acknowledged, //Used for ESN display.
          },
        })
      } else {
        console.log('Password is incorrect.')
        return res.status(401).send('Authentication failed')
      }
    } else {
      return res.status(201).send('New Account')
    }
  } catch (error) {
    return res.status(500).send('Error during validation')
  }
}

async function registerUser(req, res) {
  try {
    const { username, password, status, role } = req.body
    if(validateUserInfo(username, password) === false) {
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
      if (user.status && user.status.length > 0) {
        // Sort the status entries by date in descending order and get the first one
        const latestStatus = user.status.sort((a, b) => new Date(b.date) - new Date(a.date))[0].status;
        // Return the user object with the latest status
        return { ...user.toObject(), status: latestStatus };
      } else {
        // If there are no status entries, return the user with a default or undefined status
        return { ...user.toObject(), status: 'undefined' };
      }
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
        console.log('Updated document:', updatedDocument);
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
