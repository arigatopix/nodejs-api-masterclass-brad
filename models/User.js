const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ],
    required: [true, 'Please add an email'],
    unique: true
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // false คือถ้ามีการเรียก api จะไม่แสดงผล
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createAt: {
    type: Date,
    default: Date.now
  }
});

// *Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    // ถ้าไม่เปลี่ยนแปลง password ป้องกัน error ตอนสร้าง forgotPassword
    next();
  }

  const salt = await bcrypt.genSalt(10);
  // เก็บ hash ลง db
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// *Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  // methods คือเราจะเรียกใช้ใน controllers ต้อง query ข้อมูลก่อน
  // statics คือ acces ใน Schema ได้โดยตรง และคำนวณในไฟล์ Schema
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// *Match user entered password to hashed password in database ใช้ compare text ที่เข้ามากับ db
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
  // this.password คือ user ปัจจุบันที่ query ออกมาใน controllers/auth.js
};

// *Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
  // 1) Generate token เป็นคำยากๆ เพื่อยืนยันการ reset password
  const resetToken = crypto.randomBytes(20).toString('hex');
  // มี toString('hex') เพราะตัว crypto.randomBytes(20) เป็น buffer

  // 2) Hash token and set to resetPasswordToken field
  // hash เพื่อไม่ให้คนดึง token ไปแสดงผลใน req.user object ต้องแก้ hash ก่อน
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set Expire 10 min
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // 3) ส่ง resetToken ไปสร้าง url และนำกลับมา hash เช็คกับ field resetPasswordToken ใน DB
  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
