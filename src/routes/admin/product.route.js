import express from "express";
import * as productController from "../../controllers/admin/product.controller";

const router = express.Router();

router.get("/", productController.getAllProduct);
router.get("/:id", productController.getDetailProduct);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
router.delete("/", productController.deleteProductAll);

export default router;
