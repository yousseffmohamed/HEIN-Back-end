const express = require('express');
const router = express.Router();
const {
    getActiveDeals,
    getAllDeals,
    getDealById,
    createDeal,
    updateDeal,
    deleteDeal
} = require('../controller/deal-controller');
const { authenticate } = require('../middlewares/auth-middleware');
const { authorize } = require('../middlewares/role-middleware');

router.get('/', getActiveDeals);
router.get('/all', authenticate, authorize('admin'), getAllDeals);
router.get('/:id', getDealById);

router.post('/', authenticate, authorize('admin'), createDeal);
router.put('/:id', authenticate, authorize('admin'), updateDeal);
router.delete('/:id', authenticate, authorize('admin'), deleteDeal);

module.exports = router;
