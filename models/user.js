const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  displayName: String,
  email: String,
  image: {
    type: String, default: '../assets/images/avatar.png'
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

const User = mongoose.model('User', userSchema);

module.exports = User;