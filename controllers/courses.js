const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const asyncHandler = require('../middlewares/async');

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
  console.log(courses);

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});
