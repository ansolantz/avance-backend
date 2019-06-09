# Avance (Backend)

## Habit builder

This app will help people to create good habits every day. It gives recomendations that the user should follow. The result is displayed in a feed, depending on the user actions.

This was my final project at Ironhack Web Developer bootcamp. I only had 1,5 weeks to build it, so I didn't have time to implement all features I would have liked. For the MVP I focused on three activities, Hidration, Vitamins and Simple Exercise.

The application is built in React Native with a backend using Mongo, Express and Node.js.

More information about the app and how it works is avaliable on the [React Native Rrepository here](https://github.com/ansolantz/avance-native)



## Models

User model

```
const userSchema = new Schema({
  username: String,
  password: String,
  displayName: String,
  email: String,
  image: {
    type: String, 
  },
  age: String,
  weight: String,
  height: String,
},
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
  });

```

Activity model

```
const activitySchema = new Schema({
  activityName: String,
  data: Object,
  date: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});
```

Feedback model

```
const feedSchema = new Schema({
  activityName: String,
  feedbackType: String,
  category: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  image: String,
  title: String,
  text: String,
  date: { type: Date, default: Date.now }
});
```

Questionar Answers model

```
const questAnswSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  questionId: number,
  answerId: number,
  date: { type: Date, default: Date.now }
});
```

## 

## API Endpoints (backend routes)

- GET /auth/me
  - 404 if no user in session
  - 200 with user object
  
- POST /auth/signup
  - 401 if user logged in
  - body:
    - username
    - email
    - password
  - validation
    - fields not empty (422)
    - user not exists (409)
  - create user with encrypted password
  - store user in session
  - 200 with user object
  
- POST /auth/login
  - 401 if user logged in
  - body:
    - username
    - password
  - validation
    - fields not empty (422)
    - user exists (404)
    - passdword matches (404)
  - store user in session
  - 200 with user object
  
- POST /auth/logout
  - body: (empty)
  - 204
  
- PUT /user/:id
  - body:
    - userInfo
  - update user info

- DELETE /user/:id
  - body:
    - userInfo
  - delete user

- POST /user/addActivity
  - body:
    - activityType
  - add new activity with date
  
- GET /user/getActivity
  - body:
    - activityType
  - get registred activities.
  
- POST /user/addQuestionairreAnswer
  - body:
    - questionId
    - answerId
  - add new questionnaire answer with date
  
- GET /user/feedback
  - get array of all user feedback
  - 200 OK with array of feedback objects
  

## Links

###The app

[Deploy Link (mobile)](https://exp.host/@ansolantz/avance-native)

### Git

[Repository Link](https://github.com/ansolantz/avance-backend)


