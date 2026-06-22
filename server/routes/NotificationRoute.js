const express = require('express');
const { clearByRole } = require('../controllers/NotificationController');
const auth = require('../middleware/auth');

const router = express.Router();

router.delete('/:role', auth(), clearByRole);

module.exports = router;
