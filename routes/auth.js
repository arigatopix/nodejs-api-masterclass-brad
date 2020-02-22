// auth route = create, reset password, login, bla bla,
// user route = CRUD for admin update user, get user
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  register,
  login,
  getMe,
  forgotPassword
} = require('../controllers/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.post('/forgotpassword', forgotPassword);
module.exports = router;
