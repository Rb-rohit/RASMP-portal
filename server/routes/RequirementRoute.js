const express = require('express');
const {
  createRequirement,
  updateRequirement,
  deleteRequirement
} = require('../controllers/RequirementController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth(['customer', 'admin']), createRequirement);
router.patch('/:id', auth(['customer', 'admin']), updateRequirement);
router.delete('/:id', auth(['customer', 'admin']), deleteRequirement);

module.exports = router;
