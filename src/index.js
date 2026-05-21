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
const envOrigins = (process.env.CLIENT_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const defaultOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
const allowedOrigins = new Set([...defaultOrigins, ...envOrigins]);

mongoose.connect(`mongodb+srv://thuy0867090536_db_user:${process.env.MONGO_DB}@cluster0.i91q99o.mongodb.net/ecomweb?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
        console.log("Kết nối mongoose thành công");
    })
    .catch(err => {
        console.log(err);
    });

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow non-browser clients without Origin header
            if (!origin) return callback(null, true);

            const isLocalDevIp = /^http:\/\/\d{1,3}(\.\d{1,3}){3}:3000$/.test(origin);
            if (allowedOrigins.has(origin) || isLocalDevIp) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true, // Cho phép sử dụng cookie qua CORS
    })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

routes(app);

app.listen(port, () => {
    console.log("Server đang chạy trên cổng: " + port);
});
