const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get all courses or courses by bootcampId
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    // note: รับ bootcampId จาก bootcamp router > courses router > course controllers

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } else {
    // get all courses by advanceResultes middleware
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await (await Course.findById(req.params.id)).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Add course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  // * เรียก bootcampId จาก route แล้ว assign to bootcamp field ของ model
  // req.body.bootcamp คือ object ที่จะ POST ไปให้ DB
  req.body.bootcamp = req.params.bootcampId;

  // assign user ให้ body ข้อมูลจาก headers
  req.body.user = req.user.id;

  // * find bootcamp in database เพราะต้อง relate กัน
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  // if not found bootcamp in DB
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
      404
    );
  }

  // * Make sure user is bootcamp owner คือเอา user จาก DB มาเชคกับ header (req.user.id)
  if (bootcamp.user.toString() !== req.user.id && req.user.id !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
        401
      )
    );
  }

  // * Create document in Course model
  const course = await Course.create(req.body);
  // รับข้อมูลจาก client โดย bootcamp field คือ params จาก route

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  // * Find course by id
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`),
      404
    );
  }

  // * Make sure user is bootcamp owner คือเอา user จาก DB มาเชคกับ header (req.user.id)
  if (course.user.toString() !== req.user.id && req.user.id !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update course ${course._id}`,
        401
      )
    );
  }

  // Update course by id
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Delete course
// @route   delete /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  // * Find course by id
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`),
      404
    );
  }

  // * Make sure user is bootcamp owner คือเอา user จาก DB มาเชคกับ header (req.user.id)
  if (course.user.toString() !== req.user.id && req.user.id !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete course ${course._id}`,
        401
      )
    );
  }

  // Delete object
  await course.remove();

  res.status(201).json({
    success: true,
    data: {}
  });
});
