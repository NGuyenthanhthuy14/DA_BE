const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const routes = require('./routes');
const cors = require('cors'); // Chuyển đổi từ import sang require
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const port = process.env.SERVER_URL || 3001;

mongoose.connect(`mongodb+srv://thuy0867090536_db_user:${process.env.MONGO_DB}@cluster0.i91q99o.mongodb.net/ecomweb?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
        console.log("Kết nối mongoose thành công");
    })
    .catch(err => {
        console.log(err);
    });

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Cho phép sử dụng cookie qua CORS
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

routes(app);

app.listen(port, () => {
    console.log("Server đang chạy trên cổng: " + port);
});
