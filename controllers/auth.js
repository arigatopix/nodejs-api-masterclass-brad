const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const isValidUsernameAndPassword = require('../utils/isValidUsernameAndPassword');
const employeeInfo = require('../utils/employeeInfo');
const asyncHandler = require('../middlewares/async');
const User = require('../models/User');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, role, password } = req.body;

  const user = await User.create({
    name,
    email,
    role,
    password // จะ encrypt ด้วย bcrypt ใน middleware
  });

  // ไม่มี Validate เพราะว่าใช้ Models ในการเช็ค

  sendTokenResponse(user, 200, res);
});

// @desc    Login User
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  // รับ username password ไปให้ util
  const { username, password } = req.body;

  const isValid = await isValidUsernameAndPassword(username, password);
  // const { RefId, ResponseCode, ResponseMsg, ResultObject } = login;

  console.log(isValid);

  if (!isValid) {
    return next(new ErrorResponse(`Invalid Username or password`), 400);
  }

  const info = await employeeInfo(username);

  res.status(200).json({
    success: true,
    data: info
  });

  // console.log(login);

  // util ตอบกลับ true,false

  // เช็คว่าใน db มีข้อมูลมั้ย สร้างใน db

  // ส่ง token ออก
  // if (!ResultObject) {
  //   return next(new ErrorResponse(`Invalid Username or password`, 400));
  // }

  // // Validate Email and Password
  // if (!email || !password) {
  //   return next(new ErrorResponse('Please provide an email and password', 400));
  // }

  // // Check User in db
  // const user = await User.findOne({ email }).select('+password');
  // // select() คือเอาข้อมูล password มาด้วย เพราะใน models ตั้ง false(ไม่แสดง) ไว้

  // if (!user) {
  //   return next(new ErrorResponse('Invalid credentials', 401));
  // }

  // // Check if password matches
  // // เช็ค password hash โดยใช้ methods จาก Models
  // const isMatch = await user.matchPassword(password);

  // if (!isMatch) {
  //   return next(new ErrorResponse('Password is not match', 401));
  // }

  // // send cookie, token and response to client with helper function
  // sendTokenResponse(user, 200, res);
});

// Get token from models, create cookie and send response [Helper function]
const sendTokenResponse = (user, statusCode, res) => {
  // จะส่ง cookie กลับไปให้ client พร้อมกับข้อมูล response object
  // helper function รับ user, statusCode, res object

  // create token
  const token = user.getSignedJwtToken();

  const options = {
    // https://www.npmjs.com/package/cookie
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ), // หน่วย ms กรณีใช้  maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.sucure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options) // key ที่แสดงใน browser, value, options
    .json({
      success: true,
      token
    });
};

// @desc    Get Current User
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // เอา object user ที่มาจาก middleware มาค้นหาอีกที ก็จะได้ object จาก db เหมือนกัน แต่ไม่มี password เพราะ select: false
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
});

// @desc    Update User details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: user });
});

// @desc    Update Password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  // ! เกี่ยวกะ password อย่าลืมเพิ่ม select('+password')
  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.matchPassword(req.body.currentPassword);

  // check current password in db
  if (!isMatch) {
    return next(new ErrorResponse('Password is incorrect'), 401);
  }

  // Save a new password
  user.password = req.body.newPassword;
  await user.save();

  // Send new token
  sendTokenResponse(user, 200, res);

  // token จะบอกว่าคือใคร ซึ่ง token เก่าก็ยังใช้ได้ แต่จะ expire ไวกว่าอันใหม่
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse(`There is no user with thai email`, 404));
  }

  // * Get reset TOKEN from models
  // สร้าง token พร้อมกับส่ง token ไปที่ email ของ user (ไปแบบ url) เก็บ token และเวลาหมดอายุ
  // เอา token มาค้นหาใน field "resetPasswordToken" เพื่อยืนยันว่ามาจาก email เจ้าของจริงๆ
  // ให้สร้าง password ใหม่ คล้ายๆ register
  const resetToken = user.getResetPasswordToken();

  // seve resetToken to DB
  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request in ${process.env.RESET_PASSWORD_EXPIRE} minutes to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);

    // ถ้า error ให้ reset ข้อมูล token, expire ต้องเข้า link ใหม่เพื่อขอ token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset Password
// @route   PUT /api/v1/auth/resetpassword/:resttoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // get hashed token : คือเอา url มา hashed แล้วเช็คว่าตรงกัน Database มั้ย
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() } // ถ้า expire ก็ต้องขอใหม่
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  // reset token and expireed token
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // Save to DATABASE
  await user.save();

  sendTokenResponse(user, 200, res);
});
