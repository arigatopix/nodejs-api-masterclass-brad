const express = require('express');
const dotenv = require('dotenv');

// * Route File ของ Stephen จะกำหนด require ที่ Mount routers เลย
const bootcamps = require('./routes/bootcamps');

// Load env vars objects (โหลดจากไฟล์ไม่ได้ config ในไฟล์กำหนด path)
dotenv.config({ path: './config/config.env' });

const app = express();

// * Mount routers
// app.use() อยู่ในเรื่อง middleware จะกำหนด route ไหน sequence ไหนก่อนค่อยว่ากัน
app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
