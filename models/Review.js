const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Plase add a title for review'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Plase add some text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Plase add a rating between 1 and 10']
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

// * Prevent user from submitting more than one review per bootcamp
// ให้ 1 user สร้าง review ใน 1 bootcamp ได้ครั้งเดียว
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// * Average Bootcamp Rating by aggregate(การสรุป)
// Group bootcamp ใน review แล้วทำการ average Rating แล้ว save ใน BootcampSchema
// Statics คือ จะไม่เรียกใช้ใน controllers เลย ให้มันจบที่ Models
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
  const obj = await this.aggregate([
    // aggregate เหมือน SQL พวก query สามารถสร้าง field ใหม่ขึ้นมา จากการสรุป (group by) เป็นต้น
    // https://devahoy.com/blog/2016/06/mongodb-aggregation-example/
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  // Send to database
  try {
    // * เรียก Bootcamp Schema
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.bootcamp);
  // this.bootcamp คือ ReviewSchema และ fields bootcamp ส่งให้ aggregate
});

// Call getAverageRating before remove:
// ! ต้องไป Tringger ด้วย .remove() ที่ controllers และ ยังติดปัญหาตอนลบ แล้ว avg เป็น undefined
ReviewSchema.pre('remove', function() {
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);
