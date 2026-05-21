const express = require("express");
const router = express.Router();

const specialtyController = require("../controllers/specialty.controller");

router.get("/", specialtyController.getAllSpecialties);
router.get("/:slug", specialtyController.getSpecialtyBySlug);

module.exports = router;
