// auth route = create, reset password, login, bla bla,
// user route = CRUD for admin update user, get user
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth');

router.route('/register').post(register);
router.route('/login').post(login);

module.exports = router;
