// @desc    Logs request to console

// middleware คือ function ตัวนึง พอทำเสร็จก็ส่งต่อ (next) ให้กับ middleware อันต่อไปใน cycle
// ex ตอน auth เราส่ง token ไปหา DB แล้ว DB ส่ง user กลับมาแสดงผล เมื่อเราเข้า route นั้นๆ (เป็นหนึ่งใน cycle req,res)
const logger = (req, res, next) => {
  console.log(
    `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
  );
  next();
};

module.exports = logger;
