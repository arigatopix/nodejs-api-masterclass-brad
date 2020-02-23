const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Plase add a title for review'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Plase add some text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Plase add a rating between 1 and 10']
  },
  createAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId, // ralate Bootcamp models
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
