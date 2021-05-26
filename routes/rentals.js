const {Rental,validateRental} = require('../models/rental');
const {movie, Movie} =require('../models/movie');
const {Customer}=require('../models/customer');
const mongoose = require('mongoose');
const Fawn = require('fawn');            //fawn is used to do transaction i.e. to perform two opr. simultaneouly otherwise none will perform
const express = require('express');     //fawn// //in this case rentaled movie and number of movie left in stock will be performed simultaneously
const router = express.Router();       //used to run perticluar route or api through given api which is defined in index.js

//intitialising fawn in mongoose
Fawn.init(mongoose);

router.get('/',async (req,res)=> {
    const rentals = await Rental.find().sort('-dateOut');
});

router.post('/' ,async  (req,res)=> {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message)

    const customer =await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send('Invalid Customer');

    const movie =await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send('Invalid Movie');

    if (movie.numberInStock===0) return res.status(400).send('Movie not in Stock');

    let rental = new Rental({
        customer:{
            _id : customer._id,
            name : customer.name,
            phone : customer.phone
        },
        movie : {
            _id : movie._id,
            title : movie.title,
            dailyRentalRate : movie.dailyRentalRate
        }
    });
  try{                          
    new Fawn.Task()     //tasks that are to be performed i.e. saving the rentals and updating movies 
    .save('rentals',rental)
    .update('movies',{_id: movie._id},{
        $inc: { numberInStock:-1}
    })
    .run();    
    res.send(rental);
  }
  catch(ex){
      res.status(500).send('something failed');
  }
});

module.exports = router;