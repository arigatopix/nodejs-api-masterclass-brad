const express = require('express');
// ** function ของ express
const router = express.Router();
// กำหนด routes ของ bootcamps

// ใช้ route เดียวกัน แต่ต่าง method
// *GET all bootcamps
router.get('/', (req, res) => {
  res.status(200).json({ success: true, msg: 'Show all bootcamps' });
});

// *GET one bootcamp
router.get('/:id', (req, res) => {
  res
    .status(200)
    .json({ success: true, msg: `Show bootcamp id :${req.params.id}` });
});

// *POST (create) bootcamp
router.post('/', (req, res) => {
  res.status(201).json({ success: true, msg: 'Create new bootcamp' });
});

// *UPDATE entry bootcamp (ต้องระบุ :id ที่ route (req.params.id คือการเอาไปใช้งาน))
router.put('/:id', (req, res) => {
  res
    .status(200)
    .json({ success: true, msg: `Update bootcamp ${req.params.id}` });
});

// *DELETE bootcamp อย่าลืมเปลี่ยน method ตอน copy
router.delete('/:id', (req, res) => {
  res
    .status(200)
    .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
});

module.exports = router;
