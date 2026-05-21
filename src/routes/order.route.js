import express from "express";
import * as orderController from "../controllers/order.controller";
import { verifyUser } from "../middleware/verifyRole";

const router = express.Router();

router.post("/create", verifyUser, orderController.createOrder);
router.get("/user/:userId", verifyUser, orderController.getOrdersByUser);
router.get("/detail/:id", verifyUser, orderController.getOrderDetail);

export default router;
