const express = require('express');
const router = express.Router({ mergeParams: true }); // re-route from bootcamps

// Models
const Review = require('../models/Review');

// Middleware protect route with token
const { protect, authorize } = require('../middlewares/auth');
const advanceResults = require('../middlewares/advancedResults');

const { getReviews } = require('../controllers/reviews');

router.route('/').get(
  advanceResults(Review, {
    path: 'bootcamp',
    select: 'name description'
  }),
  getReviews
);

router.route('/:id').get(getReviews);

module.exports = router;
