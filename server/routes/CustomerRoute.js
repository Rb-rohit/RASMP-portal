const express = require('express');
const {
  updateProfile,
  changePassword
} = require('../controllers/CustomerController');
const auth = require('../middleware/auth');

const router = express.Router();

router.patch('/profile', auth(['customer', 'admin']), updateProfile);
router.patch('/password', auth(['customer', 'admin']), changePassword);

module.exports = router;
