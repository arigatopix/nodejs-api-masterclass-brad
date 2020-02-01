const express = require('express');
const dotenv = require('dotenv');

// * Middlewares
// ใช้ log method และ status
const morgan = require('morgan');

// * Route File ของ Stephen จะกำหนด require ที่ Mount routers เลย
const bootcamps = require('./routes/bootcamps');

// * Load env vars objects (โหลดจากไฟล์ไม่ได้ config ในไฟล์กำหนด path)
dotenv.config({ path: './config/config.env' });

const app = express();

// use middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// * Mount routers
// app.use() คือการเรียกใช้ middleware function ซึ่งเป็นหนึ่งใน cycle ของ req,res มาเมื่อโดนเรียก next
app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
