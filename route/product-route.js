const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    addProduct,
    getProductBySlug,
    getProductsByCategory,
    getProductsByDepartment,
    searchProducts,
    updateProduct,
    deleteProduct
} = require('../controller/product-controller');
const { authenticate } = require('../middlewares/auth-middleware');
const { authorize } = require('../middlewares/role-middleware');
const { upload } = require('../middlewares/upload-middleware');
const paginate = require('../middlewares/paginate-middleware');
const Product = require('../model/product-model');

router.get('/search', searchProducts);
router.get('/pages', paginate(Product));
router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/department/:department', getProductsByDepartment);
router.get('/:slug', getProductBySlug);

router.post('/', authenticate, authorize('admin'), upload.fields([
    {name: 'mainPic', maxCount: 1},
    {name: 'images', maxCount: 6}
]), addProduct);

router.put('/:id', authenticate, authorize('admin'), upload.fields([
    {name: 'mainPic', maxCount: 1},
    {name: 'images', maxCount: 6}
]), updateProduct);

router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

module.exports = router;
