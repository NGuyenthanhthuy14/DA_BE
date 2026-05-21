import express from "express";
import * as productController from "../../controllers/admin/product.controller";

const router = express.Router();

router.get("/", productController.getAllProduct);
router.get("/:id", productController.getDetailProduct);

export default router;
