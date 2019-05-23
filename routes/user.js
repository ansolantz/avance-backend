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
router.put('/update/:id', (req, res, next) => {

  const { displayName, email } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }
  //User.findByIdAndUpdate(req.session.user._id, req.body)

  User.findByIdAndUpdate(req.params.id, req.body)

    //User.findByIdAndUpdate(req.params.id, { displayName, email })
    .then(() => {
      //res.json({ message: `User with ${req.session.user._id} is updated.` });
      res.json({ message: `User with ${req.params.id} is updated.` });
    })
    .catch(err => {
      res.json(err);
    })
});

module.exports = router;

