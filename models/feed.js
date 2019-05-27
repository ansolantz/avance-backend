const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedSchema = new Schema({
  activityName: String,
  feedbackType: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  image: String,
  category: String,
  title: String,
  text: String,
  date: { type: Date, default: Date.now }
});

const Feed = mongoose.model('Feed', feedSchema);

module.exports = Feed;