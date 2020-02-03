// * Error Response
const ErrorResponse = require('../utils/errorResponse');
// * Call Model
const Bootcamp = require('../models/Bootcamp');
// * asyncHandler เอาไว้ลดรูป try...catch block
const asyncHandler = require('../middlewares/async');

// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes
// สร้างแต่ละ method เป็น function (middleware) และ export ไปใช้งาน
// ใช้ route เดียวกัน แต่ต่าง method

// * กำหนด description route และ access ให้แต่ละ method จะได้กลับมาแก้ไขได้ง่าย
// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // ! อย่าลืม async await
  const bootcamps = await Bootcamp.find();
  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desc    Get Single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  // รับ param มาจาก url
  const bootcamp = await Bootcamp.findById(req.params.id);

  // กรณีใช้ id ตรงกับ format ของ mongoDB แต่ไม่มี data มันจะแสดง status 200, data: null แก้ไขโดยใช้ if
  if (!bootcamp) {
    // ถ้าไม่มี bootcamp ใน DB
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // รับ req.body ไปสร้าง document ใน collection database
  // ถ้ามีข้อมูลมากกว่า Schema ที่เรากำหนดไว้ จะไม่ถูกบันทึกลงใน DB
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

// @desc    UPDATE bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // คือ return new object into database
    runValidators: true // หลังอัพเดทให้เช็คว่าถูก type มั้ย
  });

  if (!bootcamp) {
    // ถ้าไม่มี bootcamp ใน DB
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    DELETE bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    // ถ้าไม่มี bootcamp ใน DB
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: {} });
});
