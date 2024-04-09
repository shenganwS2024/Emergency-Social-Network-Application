import mongoose from 'mongoose'
import {findAllUsers, Users} from '../models/Users.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { io } from '../config/serverConfig.js'
import {userRoomMap} from '../config/globalVariables.js'
import dotenv from 'dotenv';
import axios from 'axios';


async function updateAddress(req, res) {
  const address = req.body.address;
  const username = req.params.username;
  const userFound = await Users.findOne({ username: username });

  if (!userFound) {
    return res.status(404).send('User not found');
  }
  if (!address) {
    return res.status(400).send('Address is required');
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const validAddress = response.data.predictions[0].description;
    const placeID = response.data.predictions[0].place_id;
    

    // If the response has predictions, the address can be considered valid.
    if (response.data && response.data.predictions && response.data.predictions.length > 0) {
      // You might want to return more details found in the predictions array.
      res.send({ isValid: true, predictions: response.data.predictions });
      console.log(response.data);

  userFound.address = validAddress;
  await userFound.save(); // Save changes to the database
  //alert('Address updated successfully'); // Send a success response
    } else {
      res.send({ isValid: false, message: "Address is invalid or not found" });
    }
  } catch (error) {
    console.error('Error calling Google Places API:', error);
    res.status(500).send({ error: 'Failed to validate address' });
  }

}

async function updateContact(req, res) {
    const { username } = req.params;
    const { contact1, contact2 } = req.body;
  
    // Check if contacts are the same or match the username before DB operations
    if (contact1 === contact2) {
      return res.status(400).send('Contacts cannot be the same');
    }
    if (contact1 === username || contact2 === username) {
      return res.status(400).send('Contacts cannot be the same as the user');
    }
  
    // Check if the user exists
    const userFound = await Users.findOne({ username: username });
    const contact1Found =await Users.findOne({ username: contact1 });
    const contact2Found =await Users.findOne({ username: contact2 });
    if (!userFound) {
      return res.status(404).send('User not found');
    }
  
    // Efficiently check if both contacts exist as users
    const contactsExist = await Users.find({
      username: { $in: [contact1, contact2] }
    });
  
    if (contactsExist.length < 2) {
      // This means one or both contacts don't exist in the database
      return res.status(404).send('One or both contacts not found');
    }
  
    // Assuming the operation to update contacts here
    userFound.contact.emergency=[contact1, contact2];
    if (!contact1Found.contact.primary) {
      contact1Found.contact.primary = [];
    }
    else if(!contact1Found.contact.primary.includes(username)){
        contact1Found.contact.primary.push(username);
    }

    if (!contact2Found.contact.primary) {   
        contact2Found.contact.primary = [];
    }else if(!contact2Found.contact.primary.includes(username)){
        contact2Found.contact.primary.push(username);
    }
    await userFound.save();
    await contact1Found.save();
    await contact2Found.save();
  
    res.send('Contacts updated successfully');
  }

  async function getOneAddress(req, res) {
    const { username } = req.params;
    const findOneUser = await Users.findOne ({username: username});
    if (!findOneUser) {
      return res.status(404).send('User not found');
    }
    res.status(200).send({data: {address: findOneUser.address}});
  }

  async function deleteAddress(req, res) {
    const { username } = req.params;
    const userFound = await Users.findOne ({username: username});
    if (!userFound) {
      return res.status(404).send('User not found');
    }
    userFound.address = '';
    await userFound.save();
    return res.status(200).send('Address deleted successfully');
  }

  async function deleteContact(req,res){
    const { username } = req.params;
    const userFound = await Users.findOne ({username: username});
    if (!userFound) {
      return res.status(404).send('User not found');
    }
    userFound.contact.emergency = [];
    await userFound.save();
    return res.status(200).send('Contacts deleted successfully');
  }
  

export { updateAddress, updateContact, getOneAddress, deleteAddress, deleteContact };
