const ErrorResponse = require('../utils/errorResponse');
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

  // Create token : อ้าง methods ใน UserSchema
  // ใช้ตัว user ตัวเล็กเพราะเรียกจาก methods จะเอา user จากการสร้างขึ้นมา ณ ตอนนี้
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token });
});

// @desc    Login User
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate Email and Password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check User in db
  const user = await User.findOne({ email }).select('+password');
  // select() คือเอาข้อมูล password มาด้วย เพราะใน models ตั้ง false(ไม่แสดง) ไว้

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  // เช็ค password hash โดยใช้ methods จาก Models
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Password is not match', 401));
  }

  // create token
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token });
});
