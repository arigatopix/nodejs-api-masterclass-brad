const express = require('express');

// * function ของ express
const router = express.Router();

// กำหนด routes ของ bootcamps จาก controllers code clean มากขึ้น
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius
} = require('../controllers/bootcamps');

// หา bootcamps ในรัศมี (ระยะทาง) ที่กำหนด
// api/v1/bootcamps/radius/:zipcode/:distance
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

// เมื่อ request เข้ามาที่ /api/v1/bootcamps โดยใช้ function ของ route
router
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp);

// เมื่อ request เข้ามาที่ /api/v1/bootcamps/:id (get single, put, delete)
// ระวังสลับ /:id
router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
