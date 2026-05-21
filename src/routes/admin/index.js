import express from "express";
import authRoute from "./auth.route";
import productRoute from "./product.route";
import categoryRoute from "./category.route";
import shopRoute from "./shop.route";
import orderRoute from "./order.route";
import specialtyRoute from "./specialty.route";
import userRoute from "./user.route";
import { verifyRoleAdmin } from "../../middleware/verifyRole";

const router = express.Router();

router.use("/auth", authRoute);

router.use(verifyRoleAdmin);
router.use("/products", productRoute);
router.use("/categories", categoryRoute);
router.use("/shops", shopRoute);
router.use("/orders", orderRoute);
router.use("/specialties", specialtyRoute);
router.use("/users", userRoute);

export default router;
