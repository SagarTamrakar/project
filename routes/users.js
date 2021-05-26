const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');     //picks perticlar properties to be selected //mainly provide pick method  
const {User, validate} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/me',auth,async(req,res)=> {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    let user = await User.findOne({email:req.body.email});
    if(user) return res.status(400).send('User already Registered')

    user = new User(_.pick(req.body,['name','email','password']));    //_.pick(/pick from/,/picking properties' array/ )
    const  salt = await bcrypt.genSalt(10);        //creating a salt to hash it with pwd
    user.password = await bcrypt.hash(user.password , salt); //bcrypt(data to be encrypted, salt used in encryption)

    await user.save();
    const token = user.generateAuthToken();
    res.header('x-auth-token',token).send( _.pick(user,['name','email','password']));
});

module.exports = router;