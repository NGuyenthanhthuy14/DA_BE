import express from "express";
import * as orderController from "../../controllers/vendor/order.controller";

const router = express.Router();

router.put("/:id/status", orderController.updateOrderStatus);

export default router;
