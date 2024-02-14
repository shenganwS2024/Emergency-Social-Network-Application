import Users from '../models/Users.js';
import bcrypt from 'bcryptjs';

async function validateUser(req, res) {
    try {
      const { username, password, status, role } = req.body
      // Check for existing user
      const userFound = await Users.findOne({ username }).exec()
      if (userFound) {
        const isMatch = await bcrypt.compare(password, userFound.password)
  
        if (isMatch) {
          console.log('Password is correct!')
          return res.status(200).send('Ready for login')
        } else {
          console.log('Password is incorrect.')
          return res.status(409).send('Incorrect password')
        }
      } else {
        return res.status(201).send('New Account')
      }
    } catch (error) {
      res.status(500).send('Error validating new user')
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

  export { validateUser, registerUser };