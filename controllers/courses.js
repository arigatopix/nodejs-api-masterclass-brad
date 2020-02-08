const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get all courses or courses by bootcampId
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    // ถ้ากดเข้าที่ bootcamps แสดง courses ที่อยู่ในนั้น
    // ! อย่าลืม จะต้องหาแบบ object bootcamp = bootcampId
    query = Course.find({ bootcamp: req.params.bootcampId });
    // note: รับ bootcampId จาก bootcamp router > courses router > course controllers
  } else {
    // get all courses
    query = Course.find().populate({
      // poppulate() คือแสดงผลของ collection ที่เกี่ยวข้องกับ courses
      // https://mongoosejs.com/docs/tutorials/virtuals.html
      path: 'bootcamp', // แสดง field ใน bootcamp แทน bootcampId
      select: 'name description' // แสดงผลบาง fields
    });
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
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

  // * find bootcamp in database เพราะต้อง relate กัน
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  // if not found bootcamp in DB
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
      404
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

  // Delete object
  await course.remove();

  res.status(201).json({
    success: true,
    data: {}
  });
});
