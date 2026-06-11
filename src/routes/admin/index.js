import express from "express";
import authRoute from "./auth.route";
import productRoute from "./product.route";
import shopRoute from "./shop.route";
import orderRoute from "./order.route";
import specialtyRoute from "./specialty.route";
import specialtyStoryRoute from "./specialtyStory.route";
import userRoute from "./user.route";
import vendorRoute from "./vendor.route";
import { verifyRoleAdmin } from "../../middleware/verifyRole";

const router = express.Router();

router.use("/auth", authRoute);

router.use(verifyRoleAdmin);
router.use("/products", productRoute);
router.use("/shops", shopRoute);
router.use("/orders", orderRoute);
router.use("/specialties", specialtyRoute);
router.use("/specialty-stories", specialtyStoryRoute);
router.use("/users", userRoute);
router.use("/vendors", vendorRoute);

export default router;
