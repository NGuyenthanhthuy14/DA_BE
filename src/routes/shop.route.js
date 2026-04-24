const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shop.controller");

router.post("/", shopController.createShop);
router.get("/", shopController.getAllShops);
router.get("/nearby", shopController.getNearbyShops);
router.get("/:slug", shopController.getShopBySlug);
router.patch("/:id", shopController.updateShop);

module.exports = router;