// ส่ง error ไปยัง errorResponse เพื่อแสดงผลให้ client
const ErrorResponse = require('../utils/errorResponse');

// * Custom error handler โดยสร้าง middleware ขึ้นมา
// รับ error จาก controllers (next(err)) แล้วเอา middleware ไปวางไว้ที่ server.js
const errorHandler = (err, req, res, next) => {
  // copy object เราใช้ variable error เพื่อส่งค่าให้ ErrorResponse
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
  // console.log(err.name);

  // IDM Fetch USERNAME
  if (err.code === 'ECONNABORTED') {
    const message = `Invalid Username (IDM)`;
    error = new ErrorResponse(message, 404);
  }

  // *Send Error message and statusCode to Error Response แยกแต่ละเคส
  // Mongoose bad ObjectID (id ที่ส่งมาไม่ถูกต้อง)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key (record ซ้ำ แล้วส่ง error ไปแสดงผล ทำแบบนี้เพราะใน bootcamp.js จะใช้ try...catch และส่ง next(err) อย่างเดียว ส่วน message & status config ตรงนี้)
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose Validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    // เอา message ของแต่ละ object ออกมา map array ใหม่

    error = new ErrorResponse(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || `Server Error` });
};

module.exports = errorHandler;
