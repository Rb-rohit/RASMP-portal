const express = require('express');
const { health, bootstrap } = require('../controllers/SystemController');

const router = express.Router();

router.get('/health', health);
router.get('/bootstrap', bootstrap);

module.exports = router;
