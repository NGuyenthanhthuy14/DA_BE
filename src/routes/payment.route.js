import express from "express";
import * as zaloPayController from "../controllers/zalopay.controller";
import { verifyUser } from "../middleware/verifyRole";

const router = express.Router();

router.post("/zalopay/create", verifyUser, zaloPayController.createPayment);
router.post("/zalopay/callback", zaloPayController.callback);
router.get("/zalopay/query/:orderId", verifyUser, zaloPayController.queryPayment);

export default router;
