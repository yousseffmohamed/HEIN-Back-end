const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const allowedFiles = ['.png', '.jpg', '.jpeg'];
    if (!allowedFiles.includes(extension)) {
        return cb(new Error('Allowed Files are .png, .jpg, .jpeg'), false);
    }
    cb(null, true);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname)
    }
})

const MB = 1024 * 1024;
const upload = multer({
    storage,
    fileFilter,
    limits: {fileSize: 3 * MB}
});

module.exports = {upload};