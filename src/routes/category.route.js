import express from "express";
import * as categoryController from "../controllers/category.controller";

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.get("/:slug", categoryController.getCategoryBySlug);

export default router;
