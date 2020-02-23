// protect route required token นำ middleware ไปใช้กับ route ได้เลย
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // เอาเฉพาะ token key หลัง Bearer มาใช้
    token = req.headers.authorization.split(' ')[1];
  }

  // else if(req.cookies.token) {
  //   // รับ token จาก cookies
  //   token = req.cookies.token
  // }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorize to access this route', 401));
  }
  try {
    // Verify token use jwt.verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ดูการ decoded จากเว็บ jwt จะได้ข้อมูลเป็น object ออกมา
    // {id: ...., iat: ..., exp: ...}
    // * จะมี req.user object ไว้ใช้งานในทุกๆ route ที่ถูก protect ไว้
    req.user = await User.findById(decoded.id);
    // จะมาทั้ง object User นั้นๆ เลย { _id: .., name: .., email: .. }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorize to access this route', 401));
  }
});

// Grant access to specific roles กำหนด roles ให้แต่ละ routes
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      // req.user.role ไม่อยู่ใน roles ที่กำหนดให้กับ routes
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`
        ),
        403
      );
    }

    // อย่าลืมใส่ next
    next();
  };
};
