import express from "express";
import * as specialtyController from "../../controllers/vendor/specialty.controller";

const router = express.Router();

router.get("/", specialtyController.getMySpecialties);
router.get("/pending", specialtyController.getPendingSpecialties);
router.post("/", specialtyController.createSpecialty);
router.put("/:id", specialtyController.updateSpecialty);
router.delete("/:id", specialtyController.deleteSpecialty);

export default router;
