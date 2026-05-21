const express = require("express");
const router = express.Router();

const specialtyController = require("../controllers/specialty.controller");

router.post("/", specialtyController.createSpecialty);
router.get("/", specialtyController.getAllSpecialties);
router.get("/:slug", specialtyController.getSpecialtyBySlug);
router.put("/:id", specialtyController.updateSpecialty);
router.delete("/:id", specialtyController.deleteSpecialty);

module.exports = router;
