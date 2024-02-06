const User = require('./models/Users')
const Message = require('./models/Messages')

const express = require('express')
const mongoose = require('mongoose')
const app = express()
const http = require('http').createServer(app)
//const io = require('socket.io')(http)
app.use(express.json())
app.use(express.static('public'))
const bcrypt = require('bcryptjs')
//const { nextTick } = require('process');
// const session = require('express-session')

//Connet to mongodb
mongoose.connect('mongodb+srv://yus2:1111@fse.dty3o9p.mongodb.net/ESN', {})

//Configuration for session management

//validate
app.post('/validate', async (req, res) => {
  try {
    const { username, password, status, role } = req.body
    // Check for existing user
    const userFound = await User.findOne({ username }).exec()
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
})

//register
app.post('/register', async (req, res) => {
  try {
    const { username, password, status, role } = req.body
    const user = new User({ username, password, status, role })
    await user.save()
    res.status(201).send('User registered successfully')
  } catch (error) {
    res.status(500).send('Error registering new user')
  }
})

module.exports = http
