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
  }
});

// *Statics *s* คือใช้ method กับ Schema model ได้โดยตรง
// method ต้องเรียก query ก่อนแล้วใช้งาน method (เช่นใน controllers)
CourseSchema.statics.getAverageCost = async function(bootcampId) {
  console.log('Calculating average cost...'.blue);

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

  // Send to database
  try {
    // * เรียก Bootcamp Schema จาก Course Schema *
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10 // หารก่อนแล้วปัดขึ้นให้เป็น จน. เต็ม
    });
    console.log(Math.ceil(obj[0].averageCost / 10) * 10);
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
  // ! ถ้าไม่มี course จะ crash
});

module.exports = mongoose.model('Course', CourseSchema);
