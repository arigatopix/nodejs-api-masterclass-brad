const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get all reviews in course
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    //* Get All reviews in a Bootcamp
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    // note: รับ bootcampId จาก bootcamps router > reviews controllers > reviews router

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else {
    //* Get all reviews All Bootcamp
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: review });
});
