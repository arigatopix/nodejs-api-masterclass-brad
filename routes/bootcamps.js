const express = require('express');

// Include other resourse routers เมื่อค้นหา courses ผ่าน bootcamps ให้ re-direct ด้วย middleware
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

// * function ของ express
const router = express.Router();

// protect route with token
// authorize คือกำหนดสิทธิ์ของ user ว่า role ไหนทำอะไรได้
// ! authorize อยู่หลัง protect
const { protect, authorize } = require('../middlewares/auth');

// *Re-Route into other resource routers ส่ง :bootcampId ไปด้วย (อย่าลืม set mergeParams ที่ Router ของ courses)
// Router middleware
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

// กำหนด routes ของ bootcamps จาก controllers code clean มากขึ้น
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
} = require('../controllers/bootcamps');

// * USE AdvanceResults โดยเรียก middleware ผ่าน .get() ต้องมี model ด้วย
const AdvancedResults = require('../middlewares/advancedResults');
const Bootcamp = require('../models/Bootcamp');

// หา bootcamps ในรัศมี (ระยะทาง) ที่กำหนด
// api/v1/bootcamps/radius/:zipcode/:distance
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

// เมื่อ request เข้ามาที่ /api/v1/bootcamps โดยใช้ function ของ route
router
  .route('/')
  .get(AdvancedResults(Bootcamp, 'courses'), getBootcamps) // ใช้ handler middleware ได้หลายๆ อัน
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

// เมื่อ request เข้ามาที่ /api/v1/bootcamps/:id (get single, put, delete)
// ระวังสลับ /:id
router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

// upload photo
router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

module.exports = router;
