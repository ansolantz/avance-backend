const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const activitySchema = new Schema({
  activityName: String,
  data: Object,
  date: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});


const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;