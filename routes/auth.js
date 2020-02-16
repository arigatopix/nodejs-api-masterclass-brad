// auth route = create, reset password, login, bla bla,
// user route = CRUD for admin update user, get user
const express = require('express');
const router = express.Router();
const { register } = require('../controllers/auth');

router.route('/register').post(register);

module.exports = router;
