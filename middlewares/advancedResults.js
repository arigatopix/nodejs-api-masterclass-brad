// *พวก Advance filtering query ใช้ใน routes
const advancedResults = (model, populate) => async (req, res, next) => {
  // Function ซ้อน function
  let query;
  // รับ query string เช่น ?location.city=Boston&jobGuarantee=true&averageCost[gt]=100&select=name
  // ได้ object { location.city : "Boston", jobGuarantee: "true", averageCost: { "gt": 100 }, select:"name" }
  // { select: "name" } ไม่ใช่ข้อมูลใน DB เราจะตัด query นี้ออกตรง removeFields

  // Copy req.query object
  const reqQuery = { ...req.query };

  // * Field to exclude query (เช่น เมื่อเราเลือก ?select=name,housing&housing=false)
  // ตรง fields ?select, ?sort มันไม่มีใน Database เลยตัด query นี้ออกจากการค้นหา .find(...)
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete object ที่มี key ตาม select=name,housing หรือ sort=-1
  removeFields.forEach(param => delete reqQuery[param]);

  // * Create query string
  // stringify แปลงจาก json to string
  let queryStr = JSON.stringify(reqQuery);

  // * แปลงจากข้อความเช่น gt (greater than), lte ให้เป็น query แบบ mongoDB คือ $gt, $lte
  // https://docs.mongodb.com/manual/reference/operator/query/gt/
  // * replace(word, ทำเป็น function ได้ด้วย สุดยอด)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  // \b คือจะหาคำเริ่มต้น g และตัวลงท้ายด้วยตัว t เท่านั้น และ | คือ or ใน Regular Ex.

  // * หาข้อมูล query params แปลงกลับเป็น json แล้วเอาไปใช้กับ .find() ของ mongoDB
  query = model.find(JSON.parse(queryStr));

  // * Select Field เอา query "?select" มาใช้งาน เพื่อเลือกแสดงข้อมูล
  // ใช้ร่วมกับ .select() method ของ mongoose
  // https://mongoosejs.com/docs/queries.html
  if (req.query.select) {
    // ถ้ามี select query

    // * เอา fields ไปใช้ค้นหาใน mongoDB
    // ex: query.select('name occupation');
    const fields = req.query.select.split(',').join(' ');

    // select เป็น method ของ mongoose ใช้เพื่อเลือกข้อมูลมาแสดงรึไม่
    query = query.select(fields);
  }

  // * Sort by (เอา ?sort มาใช้งานกับ mongoose)
  if (req.query.sort) {
    // ex: ?sort=name คือเรียงตาม field name
    const sortBy = req.query.sort.split(',').join(' ');

    query = query.sort(sortBy);
    // sort ตรงนี้เป็น method ของ mongoose
  } else {
    query = query.sort('-createAt');
  }

  // * Pagination and Limit query (by mongoose)
  const page = parseInt(req.query.page, 10) || 1;
  // รับค่าแปลงเป็นจำนวนเต็มฐานสิบ และตั้ง page default = 1
  const limit = parseInt(req.query.limit, 10) || 25;
  // .limit() method คือจำนวนข้อมูลที่จะ return
  const startIndex = (page - 1) * limit;
  // ใช้คู่กับ skip() ข้อมูลลำดับ 0 ถึง limit หน้าสอง ข้อมูลอันที่ 10 ขึ้นไปเป็นต้น (หาก limit = 10)
  // skip() คือจำนวนข้อมูลที่ "ไม่แสดง" หน้าแรก
  const endIndex = page * limit;
  // endIndex คือข้อมูลตัวสุดท้าย
  const total = await model.countDocuments(reqQuery);
  // countDocuments() คือนับข้อมูลทั้งหมดใน collection ไม่สน index (ช้า)
  // เพิ่ม (reqQuery) เข้าไป (ค้นหา index) เวลาคำนวน page.next, page.prev จะเอา query ที่เราต้องการแสดงมานับเท่านั้น

  // Pagination object send to client
  const pagination = {};

  if (endIndex < total) {
    // ข้อมูลตัวสุดท้ายน้อยกว่าจำนวนข้อมูลทั้งหมดใน Collection มีหน้าถัดไป
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    // ข้อมูลที่ไม่ใช่ page 1 (เพราะ startIndex = 0) แสดง previous
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  query = query.skip(startIndex).limit(limit);

  // Populate query
  if (populate) {
    query = query.populate(populate);
    // poppulate() คือแสดงผลของ collection ที่เกี่ยวข้องกับ courses
    // https://mongoosejs.com/docs/tutorials/virtuals.html
  }

  // * Execution Query
  const results = await query;

  // send to client
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  // !อย่าลืมเรียก next middleware
  next();
};

module.exports = advancedResults;
