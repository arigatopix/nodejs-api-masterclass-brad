// https://www.acuriousanimal.com/blog/2018/03/15/express-async-middleware
// สร้าง function สำหรับไม่เขียน code ซ้ำไปมาใน try...catch block (ใน controllers/bootcamp.js)
// หลักการคือเอา function ไปครอบ controller อีกทีนึง

const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;

/* NOTE
 *
 ! เดิม 
 exports.getBootcamp = async (req, res, next) => {
  TODO จะตัด try...catch ออก โดยใช้ asyncHandler middleware 
  TODO หลักการคือใช้ Promise object ถ้าไปต่อได้ ก็ resolve และ controller ก็ทำงาน
  TODO ถ้าเกิด error ก็จะ catch แล้วเรียก function next
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({ success: true, data: bootcamp });
  } catch (err) {
    next(err);
  }
};
 
 ! ใหม่
 exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ success: true, data: bootcamp });
});
 */

// ไม่ใช่ next() function แบบนี้เพราะ จะทำ next ก็ต่อเมื่อ resolve หรือ catch (or error) เท่านั้น
// catch จะรับ error มาจาก bootcamp controller ถ้ามี error นะ
