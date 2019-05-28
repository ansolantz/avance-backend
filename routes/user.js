const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const User = require('../models/user');
const Activity = require('../models/activity');
const Feed = require('../models/feed');


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


const checkIfGoalAchieved = (userId, activityName, positiveGoal) => {

  Activity.find({
    $and: [
      { activityName },
      { userId },
      {
        $where: function () {
          today = new Date();
          today.setHours(0, 0, 0, 0);
          return this._id.getTimestamp() > today
        }
      }
    ]
  }, function (err, results) {
    if (results.length === positiveGoal) {
      console.log("Goal reched!")
      addToFeed(activityName, userId)
    }
  });
}


//  POST    '/addActivity'
router.post('/addActivity', (req, res, next) => {
  const { activityName, positiveGoal, userId, data } = req.body;

  Activity.create({ activityName, userId, data })
    .then((response) => {
      console.log("Adding activity to db")

      if (positiveGoal > 0) {
        checkIfGoalAchieved(userId, activityName, positiveGoal)
      }
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

function addToFeed(activityName, userId) {
  const feedbackType = 'positive';

  if (activityName === 'drink-water') {
    const category = 'Hidration';
    const image = '../assets/images/hydration.jpg';
    const title = 'Congrats you reached your daily goal!';
    const text = 'You drank 8 glasses of water today!'

    Feed.create({ activityName, userId, feedbackType, category, image, title, text });
  }

}

//  POST    '/addToFeed'
router.post('/addToFeed', (req, res, next) => {
  const { activityName, userId, feedbackType, category, image, title, text } = req.body;

  Feed.create({ activityName, userId, feedbackType, category, image, title, text })
    .then((response) => {
      console.log("Adding feed to db")
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


//  GET    '/getFeed'
router.get('/getFeed/:id', async (req, res, next) => {

  if (req.params.id) {
    const user = await Feed.find({ userId: req.params.id });
    console.log("Getting user feed from db")
    res.json(user);
  } else {
    res.status(500).send()
  }

});



module.exports = router;

