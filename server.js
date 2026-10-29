const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;
const dbconfig = require('./config/DB-config');
const cors = require('cors');

dbconfig.connectDB();

app.use(cors({origin: 'http://localhost:4200'}));
app.use(express.json());

app.use('/files', express.static(path.join(__dirname, 'uploads')));
app.use('/user', require('./route/user-route'));
app.use('/products', require('./route/product-route'));
app.use('/auth', require('./route/auth-route'));
app.use('/orders', require('./route/order-route'));
app.use('/payments', require('./route/payment-route'));
app.use('/deals', require('./route/deal-route'));
app.use('/reviews', require('./route/review-route'));

app.listen(port, console.log(`Server Started on Port ${port}`));
