import express from "express";
import * as shopController from "../../controllers/vendor/shop.controller";

const router = express.Router();

router.get("/", shopController.getMyShop);
router.post("/", shopController.createShop);
router.put("/", shopController.updateMyShop);
router.patch("/", shopController.updateMyShop);
router.delete("/", shopController.deleteMyShop);

export default router;
