const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AdvancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/auth');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/users');

// * ใช้ middleware กับทุก request ที่เข้ามาใน route ด้านล่าง
router.use('/', protect);
router.use('/', authorize('admin'));
// ! อย่าลืมกำหนด TOKEN ให้กับ Postman

router
  .route('/')
  .get(AdvancedResults(User), getUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
