const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Plase add a course title']
  },
  description: {
    type: String,
    required: [true, 'Plase add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Plase add a number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Plase add a tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Plase add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean
  },
  createAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId, // ralate Bootcamp models
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// *Statics *s* คือใช้ method กับ Schema model ได้โดยตรง
// method ต้องเรียก query ก่อนแล้วใช้งาน method (เช่นใน controllers)
CourseSchema.statics.getAverageCost = async function(bootcampId) {
  // db.collection.aggregate() method
  // https://docs.mongodb.com/manual/reference/method/db.collection.aggregate/#group-by-and-calculate-a-sum

  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId } // bootcamp ใน Course ตรงกับ id Bootcamp
    },
    {
      $group: {
        // ข้อมูลใน course ไปแสดงใน boocamp
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' }
      }
    }
  ]);

  console.log(obj);
  // Send to database
  try {
    await this.model('Bootcamp').findByIdAndUpdate(
      bootcampId,
      obj[0]
        ? // เช็คว่ามีข้อมูลมั้ย ป้องกัน mongoose undefiend
          { averageCost: Math.ceil(obj[0].averageCost / 10) * 10 }
        : { averageCost: undefined }
    );
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save: post (หลัง) pre (ก่อน)
CourseSchema.post('save', function() {
  // เรียก static คล้ายๆ class ของ ES6 จากนั้น save ใน bootcamp model
  // เอา bootcamp (id) ไปคำนวณ
  this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove: ถ้า course ลบแล้ว ให้คำนวน AverageCost อีกรอบ
CourseSchema.pre('remove', function() {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
