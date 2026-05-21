import express from "express";
import * as shopController from "../../controllers/admin/shop.controller";

const router = express.Router();

router.get("/", shopController.getAllShops);
router.get("/:slug", shopController.getShopBySlug);
router.get("/:id/products", shopController.getShopProduct);
router.post("/", shopController.createShop);
router.patch("/:id", shopController.updateShop);
router.delete("/:id", shopController.deleteShop);

export default router;
