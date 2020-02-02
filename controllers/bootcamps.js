// * Call Model
const Bootcamp = require('../models/Bootcamp');

// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes
// สร้างแต่ละ method เป็น function (middleware) และ export ไปใช้งาน
// ใช้ route เดียวกัน แต่ต่าง method

// * กำหนด description route และ access ให้แต่ละ method จะได้กลับมาแก้ไขได้ง่าย
// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Show all bootcamps' });
};

// @desc    Get Single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Show bootcamp id :${req.params.id}` });
};

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async (req, res, next) => {
  try {
    // รับ req.body ไปสร้าง document ใน collection database
    // ถ้ามีข้อมูลมากกว่า Schema ที่เรากำหนดไว้ จะไม่ถูกบันทึกลงใน DB
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({ success: true, data: bootcamp });
  } catch (err) {
    // กรณี error แทนที่จะค้างไปเฉยๆ ให้ส่ง status และผลให้ user รู้'
  }
  res.status(400).json({ success: false });
};

// @desc    UPDATE bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Update bootcamp ${req.params.id}` });
};

// @desc    DELETE bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
};
