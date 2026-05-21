import express from "express";
import * as categoryController from "../../controllers/admin/category.controller";

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.get("/:slug", categoryController.getCategoryBySlug);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.patch("/:id/approve", categoryController.approveCategory);
router.patch("/:id/reject", categoryController.rejectCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;
