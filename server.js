const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Colors command in console
require('colors');

// * Middlewares
const errorHandler = require('./middlewares/error');

// * Load env vars objects (โหลดจากไฟล์ไม่ได้ config ในไฟล์กำหนด path)
dotenv.config({ path: './config/config.env' });

// * Route File ของ Stephen จะกำหนด require ที่ Mount routers เลย
const bootcamps = require('./routes/bootcamps');

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

// * Mount routers
// app.use() คือการเรียกใช้ middleware function ซึ่งเป็นหนึ่งใน cycle ของ req,res มาเมื่อโดนเรียก next
app.use('/api/v1/bootcamps', bootcamps);

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
