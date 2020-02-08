const express = require('express');
const router = express.Router({ mergeParams: true });
// ! function Router()
// mergeParams: true คือเอา resource :bootcampId มาจาก bootcamps route

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
  .get(getCourses)
  .post(addCourse); // รับ /:bootcampId จาก bootcamps route

// Get Single course
router
  .route('/:id')
  .get(getCourse)
  .put(updateCourse)
  .delete(deleteCourse);

// ! อย่าลืม export ไปใช้งานใน routes
module.exports = router;
