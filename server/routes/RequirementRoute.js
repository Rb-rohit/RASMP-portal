const express = require('express');
const {
  createRequirement,
  deleteRequirement
} = require('../controllers/RequirementController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth(['customer', 'admin']), createRequirement);
router.delete('/:id', auth(['customer', 'admin']), deleteRequirement);

module.exports = router;
