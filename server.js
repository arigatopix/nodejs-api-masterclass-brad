const express = require('express');
const dotenv = require('dotenv');

// Load env vars objects (โหลดจากไฟล์ไม่ได้ config ในไฟล์กำหนด path)
dotenv.config({ path: './config/config.env' });

const app = express();

// ใช้ route เดียวกัน แต่ต่าง method
// *GET all bootcamps
app.get('/api/v1/bootcamps', (req, res) => {
  res.status(200).json({ success: true, msg: 'Show all bootcamps' });
});

// *GET one bootcamp
app.get('/api/v1/bootcamps/:id', (req, res) => {
  res
    .status(200)
    .json({ success: true, msg: `Show bootcamp id :${req.params.id}` });
});

// *POST (create) bootcamp
app.post('/api/v1/bootcamps', (req, res) => {
  res.status(201).json({ success: true, msg: 'Create new bootcamp' });
});

// *UPDATE entry bootcamp (ต้องระบุ :id ที่ route (req.params.id คือการเอาไปใช้งาน))
app.put('/api/v1/bootcamps/:id', (req, res) => {
  res
    .status(200)
    .json({ success: true, msg: `Update bootcamp ${req.params.id}` });
});

// *DELETE bootcamp อย่าลืมเปลี่ยน method ตอน copy
app.delete('/api/v1/bootcamps/:id', (req, res) => {
  res
    .status(200)
    .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
});

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
