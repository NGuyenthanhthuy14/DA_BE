import express from "express";
import * as shopController from "../controllers/shop.controller";

const router = express.Router();

router.get("/", shopController.getAllShops);
router.get("/products/:id", shopController.getShopProduct);
router.get("/nearby", shopController.getNearbyShops);
router.get("/with-specialties", shopController.getShopsWithSpecialties);
router.get("/:slug", shopController.getShopBySlug);
router.get("/:id/products", shopController.getShopProduct);

export default router;
