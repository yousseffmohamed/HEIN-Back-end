module.exports = (Model) => async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 8);
        const skip = (page - 1) * limit;
        const sortBy = req.query.sort || 'createdAt';
        const order = req.query.order === 'desc' ? -1 : 1;

        const [results, total] = await Promise.all([
            Model.find().sort({ [sortBy]: order }).skip(skip).limit(limit),
            Model.countDocuments()
        ]);

        return res.status(200).json({
            message: `Pagination for ${Model.modelName}`,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
            total,
            count: results.length,
            data: results
        });
    } catch (error) {
        return res.status(500).json({ message: 'Pagination failed', error: error.message });
    }
};
