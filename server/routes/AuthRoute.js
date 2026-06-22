const express = require('express');
const {
    login,
    checkEmail,
    register,
    session
} = require('../controllers/AuthController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/check-email', checkEmail);
router.post('/register', register);
router.get('/session', auth(), session);

module.exports = router;
