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
    default: Date.now,
    immutable: true // กรณี update ข้อมูล เวลาจะถูก fixed เหมือนเดิม
  },
  updateAt: {
    type: Date,
    default: Date.now
  }
});

// *Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
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

module.exports = mongoose.model('User', UserSchema);
