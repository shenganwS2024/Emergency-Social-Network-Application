import Users from '../models/Users.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import reservedUsernames from '../views/bannedUsernames.json';

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

// helper function to update user status to online or offline
async function updateUserStatus(user, isOnline) { 
  try {
      user.onlineStatus = isOnline; 
      await user.save();
  } catch (error) {
      throw error; 
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
          let token;
          try {
              //Creating jwt token
              token = jwt.sign(
                  {
                      userId: userFound.id,
                      username: userFound.username
                  },
                  "fsesb2secretkey",
                  { expiresIn: "1h" }
              );
              console.log('login true token', token)
          } catch (err) {
              console.log(err);
              return res.status(500).send('Error creating token');
          }
          
          let directory;
          try {
            directory = await Users.find({});
          } catch (error) {
              console.error(error);
              res.status(500).send('Users post server error');
          }

          

          return res.status(200).json({
            success: true,
            data: {
                userID: userFound.id,
                username: userFound.username,
                token: token,
                users: directory,
                acknowledged: userFound.acknowledged      //Used for ESN display.
            },
        });
        } else {
          console.log('Password is incorrect.');
          return res.status(401).send('Authentication failed');
        }
      } else {
        return res.status(201).send('New Account')
      }
    } catch (error) {
      return res.status(500).send('Error during validation');
    }
  }


  async function registerUser(req, res) {
    try {
      const { username, password, status, role } = req.body
      if(validateUserInfo(username, password) !== true) {
        return res.status(500).send('Invalid username or password')
      }
      const user = new Users({ username, password, status, role })
      await user.save()
      let token;
      try {
          //Creating jwt token
          token = jwt.sign(
              {
                  userId: user.id,
                  username: user.username
              },
              "fsesb2secretkey",
              { expiresIn: "1h" }
          );
          console.log('register true token', token)
      } catch (err) {
          console.log(err);
          return res.status(500).send('Error creating token');
      }
      res.status(201).json({data:{token:token, userID: user.id}})
    } catch (error) {
      res.status(500).send('Error registering new user')
    }
  }

  async function logoutUser(req, res) {
    try {
      const { id,status } = req.body    //online_status
      const userFound = await Users.findById(id)
      if (userFound) {
        //updateUserStatus(userFound, false)
        res.status(200).send('User logs out successfully')
      }
      else {
        res.status(404).send('User not found during logout')
      }
    } catch (error) {
      res.status(500).send('Error logout')
    }
  }

  async function UserAcknowledged(req, res) {
    try {
      const { id } = req.body    //online_status
      const userFound = await Users.findById(id)
      if (userFound) {
        try {
          userFound.acknowledged = true; 
          await userFound.save();
        } catch (error) {
            throw error; 
        }
        res.status(200).send('User acknowledged successfully')
      }
      else {
        res.status(404).send('User not found during acknowledgement')
      }
    } catch (error) {
      res.status(500).send('Error acknowledgement')
    }
  }

  async function getUser(req, res) {
    try {
      let directory = await Users.find({});
      res.status(200).json({data:{users: directory}});
    } catch (error) {
        console.error(error);
        res.status(500).send('Users get server error');
    }
  }

  export { validateUser, registerUser, logoutUser, UserAcknowledged, getUser, validateUserInfo};