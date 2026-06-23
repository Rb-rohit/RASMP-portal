const express = require('express');
const {
  createQuotation,
  shortlistQuotation,
  selectQuotation,
  sendQuotationMessage
} = require('../controllers/QuotationController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth(['supplier', 'admin']), createQuotation);
router.post('/:id/shortlist', auth(['customer', 'admin']), shortlistQuotation);
router.post('/:id/select', auth(['customer', 'admin']), selectQuotation);
router.post('/:id/messages', auth(['customer', 'supplier', 'admin']), sendQuotationMessage);

module.exports = router;
