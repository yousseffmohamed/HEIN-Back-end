const Product = require('../model/product-model');

exports.addProduct = async (req, res) => {
    try {
        const {name, description, category, price, brand, slug, stock, department} = req.body;

        if (!req.files?.mainPic?.length) {
            return res.status(400).json({error: `Product's Main Image is Required`});
        }
        const mainPic = req.files.mainPic[0].filename;
        const images = (req.files.images || []).map(file => file.filename);

        let categoryArray = [];
        if (Array.isArray(category)) {
            categoryArray = category;
        } else if (typeof category === 'string') {
            categoryArray = category.split(',').map(c => c.trim()).filter(Boolean);
        }

        const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const myProduct = await Product.create({
            name,
            description,
            category: categoryArray,
            price: Number(price) || 0,
            brand: brand || '',
            mainPic,
            images,
            slug: productSlug,
            stock: Number(stock) ?? 0,
            department: department || 'unisex'
        });

        return res.status(201).json({message: 'Product added', data: myProduct});
    } catch (error) {
        return res.status(500).json({message: 'Failed to add product', error: error.message});
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const { q, category, department, minPrice, maxPrice, sort, page, limit } = req.query;

        const filter = {};

        if (q && q.trim()) {
            const regex = new RegExp(q.trim(), 'i');
            filter.$or = [
                { name: regex },
                { brand: regex },
                { description: regex },
                { category: regex },
                { department: regex }
            ];
        }

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (department && department !== 'all') {
            filter.department = department;
        }

        if (minPrice !== undefined && minPrice !== '' || maxPrice !== undefined && maxPrice !== '') {
            filter.price = {};
            if (minPrice !== undefined && minPrice !== '') filter.price.$gte = Number(minPrice);
            if (maxPrice !== undefined && maxPrice !== '') filter.price.$lte = Number(maxPrice);
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price-low') sortOption = { price: 1 };
        else if (sort === 'price-high') sortOption = { price: -1 };
        else if (sort === 'name') sortOption = { name: 1 };
        else if (sort === 'name-desc') sortOption = { name: -1 };

        if (page || limit) {
            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.max(1, parseInt(limit) || 8);
            const skip = (pageNum - 1) * limitNum;
            const [products, total] = await Promise.all([
                Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
                Product.countDocuments(filter)
            ]);
            return res.status(200).json({
                message: 'All Products: ',
                count: products.length,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum) || 1,
                data: products
            });
        }

        const myProducts = await Product.find(filter).sort(sortOption);
        return res.status(200).json({
            message: 'All Products: ',
            count: myProducts.length,
            total: myProducts.length,
            page: 1,
            limit: myProducts.length,
            totalPages: 1,
            data: myProducts
        });
    } catch (error) {
        return res.status(500).json({message: 'Failed to fetch products', error: error.message});
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const { q, category, department, minPrice, maxPrice, sort, page, limit } = req.query;
        const filter = {};

        if (q && q.trim()) {
            const regex = new RegExp(q.trim(), 'i');
            filter.$or = [
                { name: regex },
                { brand: regex },
                { description: regex },
                { category: regex },
                { department: regex }
            ];
        }

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (department && department !== 'all') {
            filter.department = department;
        }

        if (minPrice !== undefined && minPrice !== '' || maxPrice !== undefined && maxPrice !== '') {
            filter.price = {};
            if (minPrice !== undefined && minPrice !== '') filter.price.$gte = Number(minPrice);
            if (maxPrice !== undefined && maxPrice !== '') filter.price.$lte = Number(maxPrice);
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price-low') sortOption = { price: 1 };
        else if (sort === 'price-high') sortOption = { price: -1 };
        else if (sort === 'name') sortOption = { name: 1 };
        else if (sort === 'name-desc') sortOption = { name: -1 };

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, parseInt(limit) || 8);
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
            Product.countDocuments(filter)
        ]);

        return res.status(200).json({
            message: 'Products search results',
            count: products.length,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
            data: products
        });
    } catch (error) {
        return res.status(500).json({ message: 'Search failed', error: error.message });
    }
};

exports.getProductsByCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const myProducts = await Product.find({ category });

        if (myProducts.length === 0) {
            return res.status(404).json({
                message: 'No products in this category right now'
            });
        }

        return res.status(200).json({
            count: myProducts.length,
            data: myProducts
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

exports.getProductsByDepartment = async (req, res) => {
    try {
        const department = req.params.department;
        const myProducts = await Product.find({ department });

        if (myProducts.length === 0) {
            return res.status(404).json({
                message: 'No products in this department right now'
            });
        }

        return res.status(200).json({
            count: myProducts.length,
            data: myProducts
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

exports.getProductBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const myProduct = await Product.findOne({slug});
        if (myProduct) {
            return res.status(200).json({message: `Product with slug: ${slug}`, data: myProduct});
        } else {
            return res.status(404).json({message: `Product with Slug ${slug} Not Found`});
        }
    } catch (error) {
        return res.status(500).json({message: 'Failed to fetch product', error: error.message});
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        if (req.files?.mainPic?.length) {
            updateData.mainPic = req.files.mainPic[0].filename;
        }
        if (req.files?.images?.length) {
            updateData.images = req.files.images.map(file => file.filename);
        }
        if (updateData.price !== undefined) updateData.price = Number(updateData.price);
        if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
        if (updateData.category) {
            if (typeof updateData.category === 'string') {
                updateData.category = updateData.category.split(',').map(c => c.trim()).filter(Boolean);
            }
        }
        const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json({ message: 'Product updated', data: updated });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update product', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json({ message: 'Product deleted', data: deleted });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete product', error: error.message });
    }
};
