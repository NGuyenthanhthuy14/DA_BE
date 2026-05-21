import express from "express";
import * as specialtyController from "../controllers/specialty.controller";

const router = express.Router();

router.get("/", specialtyController.getAllSpecialties);
router.get("/:slug", specialtyController.getSpecialtyBySlug);

export default router;
