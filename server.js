const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookiePaser = require('cookie-parser');
const connectDB = require('./config/db');

// Colors command in console
require('colors');

// * Middlewares
const errorHandler = require('./middlewares/error');

// * Load env vars objects (โหลดจากไฟล์ไม่ได้ config ในไฟล์กำหนด path)
dotenv.config({ path: './config/config.env' });

// * Route File ของ Stephen จะกำหนด require ที่ Mount routers เลย
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

// * Init Express
const app = express();

// * Body Parser เอาไว้รวมก้อน request จากย่อยๆ เป็นก้อนเดียวกัน
app.use(express.json());

// * Connect to database
connectDB();

// use middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Upload photo
//www.npmjs.com/package/express-fileupload
https: app.use(fileupload());

// Cookie paser ส่ง cookie เก็บใน browser safe กว่า local storage
app.use(cookiePaser());

// Set Static folder เข้ามาดูรูปผ่าน browser ได้
app.use(express.static(path.join(__dirname, 'public')));

// * Mount routers
// app.use() คือการเรียกใช้ middleware function ซึ่งเป็นหนึ่งใน cycle ของ req,res มาเมื่อโดนเรียก next
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

// * Error Handler middleware ใช้ json แสดงผลให้กับ client
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// กำหนด variable server
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// * Global Handle unhandled promise rejections (กรณี database หรืออื่นๆ มีปัญหาให้แสดง msg)
// จะใช้ try...cratch block ใน db.js ก็ได้
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process โดยตังเลข 1 ปิด server จาก code ผิดพลาด
  server.close(() => process.exit(1));
});
