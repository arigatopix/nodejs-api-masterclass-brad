const express = require('express');
const router = express.Router({ mergeParams: true });
// * USE middleware for advanceResults query
const advanceResults = require('../middlewares/advancedResults');
const Course = require('../models/Course');

// ! function Router()
// mergeParams: true คือเอา resource :bootcampId มาจาก bootcamps route

// protect route with token
const { protect, authorize } = require('../middlewares/auth');

const {
  getCourse,
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courses');

// Get all courses
router
  .route('/')
  .get(
    advanceResults(Course, {
      // implement advanced filter
      path: 'bootcamp', // แสดง field ใน bootcamp แทน bootcampId
      select: 'name description' // แสดงผลบาง fields
    }),
    getCourses
  )
  .post(protect, authorize('publisher', 'admin'), addCourse); // รับ /:bootcampId จาก bootcamps route

// Get Single course
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse);

// ! อย่าลืม export ไปใช้งานใน routes
module.exports = router;
