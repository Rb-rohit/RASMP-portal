const express = require('express');
const {
  verifyUser,
  updateUserStatus,
  createCategory,
  updateCategory,
  generateReport
} = require('../controllers/AdminController');
const auth = require('../middleware/auth');

const router = express.Router();

router.patch('/users/:id/status', auth(['admin']), updateUserStatus);
router.patch('/users/:id/verification', auth(['admin']), verifyUser);
router.post('/categories', auth(['admin']), createCategory);
router.patch('/categories/:id', auth(['admin']), updateCategory);
router.post('/reports', auth(['admin']), generateReport);

module.exports = router;
