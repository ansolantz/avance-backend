const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');



// HELPER FUNCTIONS
const {
  isLoggedIn,
  isNotLoggedIn,
  validationLoggin,
} = require('../helpers/middlewares');



//router.put('/update/:id', isLoggedIn(), (req, res, next) => {
router.put('/update/', isLoggedIn(), (req, res, next) => {

  //const { displayName, email, url, age, weight, height } = req.body;
  const userId = req.session.currentUser._id
  console.log("inside and user is", userId);

  User.findByIdAndUpdate(userId, req.body)

    //User.findByIdAndUpdate(req.params.id, { displayName, email })
    .then(async () => {
      res.json({ message: `User with ${userId} is updated.` });
      console.log("did find user");
      try {
        const user = await User.findOne({ _id: userId });
        console.log("hi there");
        console.log(user)
        req.session.currentUser = user;
      } catch (error) {
        console.log("this is bad");
        next(error);
      }

    })
    .catch(err => {
      console.log("error finding user", err);
      res.json(err);
    })
});

module.exports = router;

