const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const User = require('../models/user');

// HELPER FUNCTIONS
const { validationLoggin } = require('../helpers/middlewares');

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

module.exports = router;

