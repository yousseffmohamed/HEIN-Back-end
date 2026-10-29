const { log } = require('console');
const mongoose = require ('mongoose');

async function connectDB() {
    try {
        const connect = await mongoose.connect(process.env.DATABASE_URI);
        console.log(`Database Connected on ${connect.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = {connectDB};