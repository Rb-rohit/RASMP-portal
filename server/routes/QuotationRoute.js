const express = require('express');
const {
  createQuotation,
  shortlistQuotation,
  selectQuotation
} = require('../controllers/QuotationController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth(['supplier', 'admin']), createQuotation);
router.post('/:id/shortlist', auth(['customer', 'admin']), shortlistQuotation);
router.post('/:id/select', auth(['customer', 'admin']), selectQuotation);

module.exports = router;
