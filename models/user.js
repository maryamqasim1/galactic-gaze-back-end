const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    default: 'user',
    enum: ['user', 'admin', 'club']
  },
  observations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Observation'
  }],
  meetups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meetup'
  }],
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  }
});

module.exports = mongoose.model('User', userSchema);