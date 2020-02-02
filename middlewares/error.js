// * Custom error handler โดยสร้าง middleware ขึ้นมา
// รับ error จาก controllers (next(err)) แล้วเอา middleware ไปวางไว้ที่ server.js
const errorHandler = (err, req, res, next) => {
  // Log to console for dev
  console.log(err.stack.red);

  res.status(500).json({ success: false, error: err.message });
};

module.exports = errorHandler;
