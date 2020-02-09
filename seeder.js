// เป็นไฟล์เอาไว้ import ข้อมูล json file ในโฟลเดอร์ _data ไป database โดยคำสั่งใน terminal
const fs = require('fs');
const mongoose = require('mongoose');

// Color in terminal
require('colors');
// Load ENV
require('dotenv').config({ path: './config/config.env' });

// Load models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

// Connect to database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

// * Read JSON files ในโฟลเดอร์ _data
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

// * Import JSON to Database function
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    // dump json to db

    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// * Delete Data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();

    console.log('Data Destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.err(err);
  }
};

// * Call function by Terminal
if (process.argv[2] === '-i') {
  // process.argv[2] คือคำสั่งใน terminal ลำดับที่ 2 (นับแบบ array)

  // เรียก import function
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
