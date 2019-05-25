const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const User = require('../models/user');
const Activity = require('../models/activity');


// HELPER FUNCTION
const { validationLoggin } = require('../helpers/middlewares');


//  POST    '/signup'
router.post('/signup', validationLoggin(),
  async (req, res, next) => {
    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username }, 'username');
      if (user) {
        return next(createError(422));
      } else {
        const salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password, salt);
        const newUser = await User.create({ username, password: hashPass });

        res.status(200).json(newUser);
      }
    } catch (error) {
      next(error);
    }
  },
);

//  POST    '/login'
router.post('/login', validationLoggin(),
  async (req, res, next) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user) {
        next(createError(404));
      } else if (bcrypt.compareSync(password, user.password)) {
        return res.status(200).json(user);
      } else {
        next(createError(401));
      }
    } catch (error) {
      next(error);
    }
  }
);


//  POST    '/logout'
router.post('/logout', (req, res, next) => {
  return res.status(204).send();
});


//  GET    '/me'
router.get('/me/:id', async (req, res, next) => {

  if (req.params.id) {
    const user = await User.findOne({ _id: req.params.id });
    res.json(user);
  } else {
    res.status(500).send()
  }
});


//  PUT    '/update'
router.put('/update/', (req, res, next) => {

  const { _id } = req.body;
  let dataToUppdate = { ...req.body };
  delete dataToUppdate._id;

  console.log("inside and user is", _id);

  User.findByIdAndUpdate({ _id }, dataToUppdate)

    .then(() => {
      res.json({ message: `User with ${_id} is updated.` })
    })
    .catch(err => { res.json(err) })
});


//  DELETE    '/delete'  -- Deleting user
router.delete('/delete/:id', (req, res, next) => {

  console.log("inside and user is", req.params.id);

  User.findByIdAndRemove(req.params.id)
    .then(() => {
      res
        .status(202)  //  Accepted
        .json({ message: `Your account is successfully deleted (id: ${req.params.id})` })
    })
    .catch(err => {
      res.status(500).json(err);
    })
});


//  POST    '/addActivity'
router.post('/addActivity', (req, res, next) => {
  const { activityName, userId } = req.body;

  Activity.create({ activityName, userId })
    .then((response) => {
      console.log("Adding activity to db")
      res
        .status(201)
        .json(response);
    })
    .catch((err) => {
      res
        .status(500)  // Internal Server Error
        .json(err)
    })

});



module.exports = router;

