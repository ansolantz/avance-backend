const express = require('express');
const createError = require('http-errors');

const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

// HELPER FUNCTIONS
const {
  isLoggedIn,
  isNotLoggedIn,
  validationLoggin,
} = require('../helpers/middlewares');



// //  GET    '/me'
router.get('/me/:id', isLoggedIn(), async (req, res, next) => {
  console.log("got param as", req.params.id);
  if (req.params.id) {

    const user = await User.findOne({ _id: req.params.id });
    console.log("got an id and found user", user);
    res.json(user);
  } else {
    res.json(req.session.currentUser);
  }
});


// router.get('/me', isLoggedIn(), (req, res, next) => {
//   req.session.currentUser.password = '*';
//   res.json(req.session.currentUser);
// });

router.post('/login', isNotLoggedIn(), validationLoggin(), async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      next(createError(404));
    } else if (bcrypt.compareSync(password, user.password)) {
      req.session.currentUser = user;
      return res.status(200).json(user);
    } else {
      next(createError(401));
    }
  } catch (error) {
    next(error);
  }
},
);

router.post('/signup', isNotLoggedIn(), validationLoggin(),
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
        req.session.currentUser = newUser;
        res.status(200).json(newUser);
      }
    } catch (error) {
      next(error);
    }
  },
);

router.post('/logout', isLoggedIn(), (req, res, next) => {
  req.session.destroy();
  return res.status(204).send();
});

router.get('/private', isLoggedIn(), (req, res, next) => {
  res.status(200).json({
    message: 'This is a private message',
  });
});




module.exports = router;
