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
      const { userId,status } = req.body    //online_status
      const userFound = await Users.findById(userId)
      if (userFound) {
        updateUserStatus(userFound, false)
      }
      res.status(200).send('User logs out successfully')
    } catch (error) {
      res.status(500).send('Error logout')
    }
  }
  // async function loginUser(req, res, next) {
  //   let { username, password } = req.body;

  //   let existingUser;
  //   try {
  //       existingUser =
  //           await Users.findOne({ username: username });
  //   } catch {
  //       const error =
  //           new Error(
  //               "Error! Something went wrong."
  //           );
  //       return next(error);
  //   }
  //   if (!existingUser || existingUser.password != password) {
  //       const error =
  //           Error(
  //               "Wrong details please check at once"
  //           );
  //       return next(error);
  //   }
  //   let token;
  //   try {
  //       //Creating jwt token
  //       token = jwt.sign(
  //           {
  //               userId: existingUser.id,
  //               username: existingUser.username
  //           },
  //           "secretkeyappearshere",
  //           { expiresIn: "1h" }
  //       );
  //   } catch (err) {
  //       console.log(err);
  //       const error =
  //           new Error("Error! Something went wrong.");
  //       return next(error);
  //   }

  //   res
  //       .status(200)
  //       .json({
  //           success: true,
  //           data: {
  //               userId: existingUser.id,
  //               username: existingUser.username,
  //               token: token,
  //           },
  //       });
  // }
  export { validateUser, registerUser, logoutUser };