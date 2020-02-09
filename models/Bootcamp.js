const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name can not be more than 50 characters']
    },
    slug: String, // เอาไว้แสดงใน url base on bootcamp name
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description can not be more than 500 characters']
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use valid URL with HTTP or HTTPS'
      ]
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number can not be more than 20 characters']
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    location: {
      // GeoJSON Point รับจาก geocoder อีกที https://mongoosejs.com/docs/geojson.html
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'] // 'location.type' must be 'Point' อีกแบบคือ polygon
      },
      coordinates: {
        type: [Number], // เป็น array ของ lat, long
        index: '2dsphere'
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: [
        // enum คือจะมี list แค่นี้ ถ้าส่งค่านอกเหนือจากนี้ error
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other'
      ]
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must can not be more than 10']
    },
    averageCost: Number, // รับ Aggregate จาก course model
    photo: {
      type: String,
      default: 'no-photo.jpg' // มันคือชื่อไฟล์ เมื่อไม่มีรูปแสดงผลรูป default ใน static file
    },
    housing: {
      type: Boolean,
      default: false
    },
    jobAssistance: {
      type: Boolean,
      default: false
    },
    jobGuarantee: {
      type: Boolean,
      default: false
    },
    acceptGi: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    // options แสดงผล virtuals course ใน Bootcamp models
    // ไม่มี field ในนี้ แต่เอาไปแสดงผล ใช้คู่กับ populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// * ใช้ Pre middleware
// Pre middleware functions are executed one after another, when each middleware calls next.

// * ต้องการกำหนด slug ให้กับ collection slug field โดยใช้ชื่อของ name (ของแต่ละ req ที่ create เข้ามา) มาแปลงเป็น slug
BootcampSchema.pre('save', function(next) {
  // this.name คือ name ของ Schema นี้
  // console.log(this.name);

  // กำหนด slug field ให้ใช้ตัวพิมพ์เล็ของ this.name
  this.slug = slugify(this.name, { lower: true });

  next();
});

// * GEOCODER & Create location field middleware
BootcampSchema.pre('save', async function(next) {
  const loc = await geocoder.geocode(this.address);
  // ใช้ async await เพราะ fetch data (ดู document)
  // เอา string จาก address field ไป process

  // save document to collecttion
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude], // loc[0] เพราะ geocoder return array
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  };

  // Do not save address (ที่ create เข้ามา) in DB เพราะเราจะใช้ formattedAddress แทน
  this.address = undefined;
  next();
});

// * Cascade delete courses when a bootcamp is deleted: ลบ bootcamp> courses ลบด้วย
BootcampSchema.pre('remove', async function(next) {
  console.log(`Courses being removed from bootcmap ${this._id}`);

  await this.model('Course').deleteMany({ bootcamp: this._id });
  // field bootcamp ใน Course model ตรงกับ _id ใน Boocamp model
  // ! ต้องไปกำหนดใน delete route ด้วยเพื่อให้ middleware สั่งให้ลบ course ออก

  next();
});

// * Reverse populate with virtuals: เอา course model มาแสดงผลแบบ virtual
// https://mongoosejs.com/docs/tutorials/virtuals.html
// ดูที่ populate()
BootcampSchema.virtual('courses', {
  // 'courses' คือกำหนดชื่อ field ตอนแสดงผล
  // ! ต้องไปกำหนด populate() method ใน controllers ตอน get ด้วย
  ref: 'Course', // ต้องการแสดง Course models
  localField: '_id', // คือ field ของไฟล์นี้
  foreignField: 'bootcamp', // คือ field ของ courses
  justOne: false // แสดงผล courses หลายๆ อัน ไม่ใช่เอามาอันเดียว
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);
