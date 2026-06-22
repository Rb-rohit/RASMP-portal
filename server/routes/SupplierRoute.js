const express = require('express');
const {
  updateVerification,
  updateProfile
} = require('../controllers/SupplierController');
const auth = require('../middleware/auth');

const router = express.Router();

router.patch('/profile', auth(['supplier', 'admin']), updateProfile);
router.patch('/:id/verification', auth(['admin']), updateVerification);

module.exports = router;
