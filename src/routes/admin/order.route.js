import express from "express";
import * as orderController from "../../controllers/admin/order.controller";

const router = express.Router();

router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderDetail);
router.put("/:id/status", orderController.updateOrderStatus);

export default router;
