const path = require('path');
// * Error Response
const ErrorResponse = require('../utils/errorResponse');
// * Call Model
const Bootcamp = require('../models/Bootcamp');
// * asyncHandler เอาไว้ลดรูป try...catch block
const asyncHandler = require('../middlewares/async');
// * geocoder แปลง zipcode เป็น lat,long
const geocoder = require('../utils/geocoder');

// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes
// สร้างแต่ละ method เป็น function (middleware) และ export ไปใช้งาน
// ใช้ route เดียวกัน แต่ต่าง method

// * กำหนด description route และ access ให้แต่ละ method จะได้กลับมาแก้ไขได้ง่าย
// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;
  // รับ query string เช่น ?location.city=Boston&jobGuarantee=true&averageCost[gt]=100&select=name
  // ได้ object { location.city : "Boston", jobGuarantee: "true", averageCost: { "gt": 100 }, select:"name" }
  // { select: "name" } ไม่ใช่ข้อมูลใน DB เราจะตัด query นี้ออกตรง removeFields

  // Copy req.query object
  const reqQuery = { ...req.query };

  // * Field to exclude query (เช่น เมื่อเราเลือก ?select=name,housing&housing=false)
  // ตรง fields ?select, ?sort มันไม่มีใน Database เลยตัด query นี้ออกจากการค้นหา .find(...)
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete object ที่มี key ตาม select=name,housing หรือ sort=-1
  removeFields.forEach(param => delete reqQuery[param]);

  // * Create query string
  // stringify แปลงจาก json to string
  let queryStr = JSON.stringify(reqQuery);

  // * แปลงจากข้อความเช่น gt (greater than), lte ให้เป็น query แบบ mongoDB คือ $gt, $lte
  // https://docs.mongodb.com/manual/reference/operator/query/gt/
  // * replace(word, ทำเป็น function ได้ด้วย สุดยอด)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  // \b คือจะหาคำเริ่มต้น g และตัวลงท้ายด้วยตัว t เท่านั้น และ | คือ or ใน Regular Ex.

  // * หาข้อมูล query params แปลงกลับเป็น json แล้วเอาไปใช้กับ .find() ของ mongoDB
  query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  // * Select Field เอา query "?select" มาใช้งาน เพื่อเลือกแสดงข้อมูล
  // ใช้ร่วมกับ .select() method ของ mongoose
  // https://mongoosejs.com/docs/queries.html
  if (req.query.select) {
    // ถ้ามี select query

    // * เอา fields ไปใช้ค้นหาใน mongoDB
    // ex: query.select('name occupation');
    const fields = req.query.select.split(',').join(' ');

    // select เป็น method ของ mongoose ใช้เพื่อเลือกข้อมูลมาแสดงรึไม่
    query = query.select(fields);
  }

  // * Sort by (เอา ?sort มาใช้งานกับ mongoose)
  if (req.query.sort) {
    // ex: ?sort=name คือเรียงตาม field name
    const sortBy = req.query.sort.split(',').join(' ');

    query = query.sort(sortBy);
    // sort ตรงนี้เป็น method ของ mongoose
  } else {
    query = query.sort('-createAt');
  }

  // * Pagination and Limit query (by mongoose)
  const page = parseInt(req.query.page, 10) || 1;
  // รับค่าแปลงเป็นจำนวนเต็มฐานสิบ และตั้ง page default = 1
  const limit = parseInt(req.query.limit, 10) || 25;
  // .limit() method คือจำนวนข้อมูลที่จะ return
  const startIndex = (page - 1) * limit;
  // ใช้คู่กับ skip() ข้อมูลลำดับ 0 ถึง limit หน้าสอง ข้อมูลอันที่ 10 ขึ้นไปเป็นต้น (หาก limit = 10)
  // skip() คือจำนวนข้อมูลที่ "ไม่แสดง" หน้าแรก
  const endIndex = page * limit;
  // endIndex คือข้อมูลตัวสุดท้าย
  const total = await Bootcamp.countDocuments(reqQuery);
  // countDocuments() คือนับข้อมูลทั้งหมดใน collection ไม่สน index (ช้า)
  // เพิ่ม (reqQuery) เข้าไป (ค้นหา index) เวลาคำนวน page.next, page.prev จะเอา query ที่เราต้องการแสดงมานับเท่านั้น

  // Pagination object send to client
  const pagination = {};

  if (endIndex < total) {
    // ข้อมูลตัวสุดท้ายน้อยกว่าจำนวนข้อมูลทั้งหมดใน Collection มีหน้าถัดไป
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    // ข้อมูลที่ไม่ใช่ page 1 (เพราะ startIndex = 0) แสดง previous
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  query = query.skip(startIndex).limit(limit);

  // * Execution Query
  const bootcamps = await query;
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps
  });
});

// @desc    Get Single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  // รับ param มาจาก url
  const bootcamp = await Bootcamp.findById(req.params.id).populate({
    path: 'courses',
    select: 'name description'
  });

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
  const bootcamp = await Bootcamp.findById(req.params.id);
  // ตอนแรกใช้ findByIdAndDelete() จะลบเฉพาะ bootcamp field แต่ไม่ลบ courses
  // ต้องใช้ .remove() เพื่อ trigger middleware ใน Bootcamp models แล้วจะลบ courses field

  if (!bootcamp) {
    // ถ้าไม่มี bootcamp ใน DB
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // REMOVE BOOTCAMP AND COURSES
  bootcamp.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc    GET bootcamps within a radius มีข้อมูล lat, long และใส่รัศมีการค้นหา
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
// รับค่า zipcode > แปลงเป็น lat,long (geoCoder) หรือจะเอา lat, long โดยตรงก็ได้ อยุ่ที่จะ design
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat, long from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Cal รัศมีการค้นหา (radius) โดยใช้รัศมีของโลกเป็นฐาน
  // radius = distance / radius of Earth
  // Earth radius = 3,963 mi หรือ 6,371 km
  const radius = distance / 3963;
  // ใช้หน่วย mile ถ้าเศษส่วนเป็น 1 คือมีรัศมีการค้นหาทั้งโลก จากพิกัด lat, long

  // * find location in distance เป็น funciton ของ mongoDB
  // https://docs.mongodb.com/manual/reference/operator/query/centerSphere/
  // * If specifying latitude and longitude coordinates, list the longitude first (x) and then latitude(y) *
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  // console.log(req.files);
  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  // path.parse() คือเอาข้อมูลของไฟล์ และ นามสกุล (ext: '.jpg') ของไฟล์เดิมมาใช้

  // upload file name to database
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // send file name to db
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
