import express from "express";
import * as shippingController from "../controllers/shipping.controller";
import { verifyUser } from "../middleware/verifyRole";

const router = express.Router();

router.post("/fee", verifyUser, shippingController.calculateShippingFee);

export default router;
