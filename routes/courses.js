const express = require('express');
const router = express.Router({ mergeParams: true });
// ! function Router()
// mergeParams: true คือเอา resource :bootcampId มาจาก bootcamps route

const { getCourses } = require('../controllers/courses');

// Get all courses
router.route('/').get(getCourses);

// ! อย่าลืม export ไปใช้งานใน routes
module.exports = router;
