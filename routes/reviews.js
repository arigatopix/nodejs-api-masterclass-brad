const express = require('express');
const router = express.Router({ mergeParams: true }); // re-route from bootcamps

// Models
const Review = require('../models/Review');

// Middleware protect route with token
const { protect, authorize } = require('../middlewares/auth');
const advanceResults = require('../middlewares/advancedResults');

const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviews');

router
  .route('/')
  .get(
    advanceResults(Review, {
      path: 'bootcamp',
      select: 'name description'
    }),
    getReviews
  )
  .post(protect, authorize('user', 'admin'), addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
