const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

module.exports = mongoose.model('User', UserSchema);
