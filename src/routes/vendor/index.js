import express from "express";
import authRoute from "./auth.route";
import productRoute from "./product.route";
import orderRoute from "./order.route";
import specialtyRoute from "./specialty.route";
import { verifyRoleVendor } from "../../middleware/verifyRole";

const router = express.Router();

router.use("/auth", authRoute);

router.use(verifyRoleVendor);
router.use("/products", productRoute);
router.use("/orders", orderRoute);
router.use("/specialties", specialtyRoute);

export default router;
