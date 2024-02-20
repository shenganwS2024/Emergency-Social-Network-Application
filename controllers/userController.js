import Users from '../models/Users.js';
import Messages from '../models/Messages.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
          await updateUserStatus(userFound, true);
          let token;
          try {
              //Creating jwt token
              token = jwt.sign(
                  {
                      userId: userFound.id,
                      username: userFound.username
                  },
                  "secretkeyappearshere",
                  { expiresIn: "1h" }
              );
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

          let messages;
          try {
            messages = await Messages.find({});
            console.log(messages);
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
                users: directory,       //Used for ESN display.
                messages: messages
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
      const user = new Users({ username, password, status, role })
      await user.save()
      res.status(201).send('User registered successfully')
    } catch (error) {
      res.status(500).send('Error registering new user')
    }
  }

  async function logoutUser(req, res) {
    try {
      const { id,status } = req.body    //online_status
      const userFound = await Users.findById(id)
      if (userFound) {
        updateUserStatus(userFound, false)
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
  export { validateUser, registerUser, logoutUser, UserAcknowledged };