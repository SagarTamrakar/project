const Joi = require('joi');      //for validation 
const bcrypt = require('bcrypt');   //hashing the password
const _ = require('lodash');      //dealing with objectIDs
const {User} = require('../models/user');
const mongoose = require('mongoose');    
const express = require('express');
const { validateRental } = require('../models/rental');
const router = express.Router();    //create the router

router.post('/', async (req, res) => {
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    let user = await User.findOne({email:req.body.email});
    if(!user) return res.status(400).send('Invalid email or password')
    const validPassword= await bcrypt.compare(req.body.password,user.password)  //bcrypt.compare(the pwd(data) you provide, hashed pwd in DB) and it returns a boolean
    if (!validPassword) return res.status(400).send('Invalid email or password')

    const token = user.generateAuthToken();
    res.send(token);
});

function validate(req) {
    const schema = {
      email:Joi.string().min(5).max(255).required().email(),
      password:Joi.string().min(5).max(255).required()
    };
  
    return Joi.validate(req, schema);
  }

module.exports = router;