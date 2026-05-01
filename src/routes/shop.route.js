const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shop.controller");

router.post("/", shopController.createShop);
router.get("/", shopController.getAllShops);
router.get("/products/:id", shopController.getShopProduct);
router.get("/nearby", shopController.getNearbyShops);
router.get("/with-specialties", shopController.getShopsWithSpecialties);
router.get("/:slug", shopController.getShopBySlug);
router.patch("/:id", shopController.updateShop);
router.get("/:id/products", shopController.getShopProduct);

module.exports = router;