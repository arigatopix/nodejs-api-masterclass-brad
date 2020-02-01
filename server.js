const express = require('express');
const dotenv = require('dotenv');

// Load env vars objects (โหลดจากไฟล์ไม่ได้ config ในไฟล์กำหนด path)
dotenv.config({ path: './config/config.env' });

const app = express();

app.get('/', (req, res) => {
  // res.send({ name: 'John Doe' });

  // * send json object
  // res.json({ name: 'John Doe' });

  // * send status
  // res.sendStatus(400);

  // send status and data
  res.status(200).json({ success: true, data: { id: 1 } });
});

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
