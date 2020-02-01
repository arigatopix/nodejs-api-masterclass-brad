const express = require('express');

// * function ของ express
const router = express.Router();

// กำหนด routes ของ bootcamps จาก controllers code clean มากขึ้น
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp
} = require('../controllers/bootcamps');

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
