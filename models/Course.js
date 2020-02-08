const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Plase add a course title']
  },
  description: {
    type: String,
    required: [true, 'Plase add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Plase add a number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Plase add a tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Plase add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean
  },
  createAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId, // ralate Bootcamp models
    ref: 'Bootcamp',
    required: true
  }
});

module.exports = mongoose.model('Course', CourseSchema);
