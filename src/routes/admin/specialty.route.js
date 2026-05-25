import express from "express";
import * as specialtyController from "../../controllers/admin/specialty.controller";

const router = express.Router();

router.get("/", specialtyController.getAllSpecialties);
router.get("/:slug", specialtyController.getSpecialtyBySlug);
router.post("/", specialtyController.createSpecialty);
router.put("/:id", specialtyController.updateSpecialty);
router.patch("/:id/approve", specialtyController.approveSpecialty);
router.patch("/:id/reject", specialtyController.rejectSpecialty);
router.delete("/:id", specialtyController.deleteSpecialty);

export default router;
