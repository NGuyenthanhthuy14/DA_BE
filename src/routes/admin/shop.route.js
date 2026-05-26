import express from "express";
import * as shopController from "../../controllers/admin/shop.controller";

const router = express.Router();

router.get("/", shopController.getAllShops);
router.patch("/:id/block", shopController.blockShop);
router.get("/:slug", shopController.getShopBySlug);
router.get("/:id/products", shopController.getShopProduct);

export default router;
