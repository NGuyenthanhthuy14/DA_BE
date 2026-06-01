import express from "express";
import * as orderController from "../../controllers/vendor/order.controller";

const router = express.Router();

router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrderDetail);
router.put("/:id/status", orderController.updateOrderStatus);

export default router;
