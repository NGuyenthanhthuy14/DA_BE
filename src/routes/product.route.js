import express from "express";
import * as productController from "../controllers/product.controller";

const router = express.Router();

router.get("/get-all", productController.getAllProduct);
router.get("/nearby", productController.getNearbyProducts);
router.get("/get-detail/:id?", productController.getDetailProduct);
router.get("/get-all-type", productController.getAllType);

export default router;
