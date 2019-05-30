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


router.get('/checkServer', async (req, res, next) => {
  res.status(200);
});


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
    console.log(`Got ${results.length} results for user ${userId} and activity=${activityName} with positiveGoal: ${positiveGoal}`)
    if (results.length === positiveGoal) {
      console.log("Goal reched!")
      addToFeed(activityName, userId)
    } else if (results.length > positiveGoal) {
      console.log('Goal already surpassed');
    } else {
      console.log('Goal not reached yet');
    }
  });
}


//  POST    '/addActivity'
router.post('/addActivity', (req, res, next) => {
  const { activityName, positiveGoal, negativeGoal, userId, data } = req.body;

  Activity.create({ activityName, userId, data })
    .then((response) => {
      console.log("Adding activity to db")

      if (positiveGoal > 0) {
        console.log(`Positive goal is ${positiveGoal}, check if it is reached`);
        checkIfGoalAchieved(userId, activityName, positiveGoal)
      } else if (negativeGoal > 0) {
        console.log(`Negativgoal is ${negativeGoal}, check if it is reached`);
        checkIfGoalAchieved(userId, activityName, negativeGoal)
      }
      else {
        console.log('No goal defined, returning')
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

  // -- This should be improved!
  if (activityName === 'drink-water') {
    const category = 'Hidration';
    const feedbackType = 'positive';
    const image = 'hydration.jpg';
    const title = 'Congrats you reached your daily goal!';
    const text = 'You drank 8 glasses of water today!'

    Feed.create({ activityName, userId, feedbackType, category, image, title, text });
  } else if (activityName === 'eat-fruit') {
    const category = 'Vitamins';
    const feedbackType = 'positive';
    const image = 'vitamins.jpg';
    const title = 'Vitamin goal acomliched!';
    const text = 'You ate 2 fruits today!'

    Feed.create({ activityName, userId, feedbackType, category, image, title, text });
  } else if (activityName === 'drink-coffee') {
    const category = 'Hidration';
    const image = 'coffe-warning-1.jpg';
    const feedbackType = 'negative';
    const title = 'Ops, take it easy!';
    const text = 'You drank to much coffe yesterday! You may want to cut down on your caffeine consumption.'

    Feed.create({ activityName, userId, feedbackType, category, image, title, text });
  } else if (activityName === 'drink-beer') {
    const category = 'Hidration';
    const image = 'beer-warning-1.jpg';
    const feedbackType = 'negative';
    const title = 'Too much acohol!';
    const text = 'The amount of alcohol that you have been drinking exceeds recommended guidelines and puts you at risk for developing alcohol-related problems, you may want to try cutting down or moderating your consumption.'

    Feed.create({ activityName, userId, feedbackType, category, image, title, text });
  } else if (activityName === 'drink-soda') {
    const category = 'Hidration';
    const image = 'sugar-warning-1.jpg';
    const feedbackType = 'negative';
    const title = 'Too much sugar!';
    const text = 'Consuming too much sugar can lead to health problems, such as increasing the risk of weight gain, diabetes, tooth cavities, and more. Try to cut down or moderating your consumption!'

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

