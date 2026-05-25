import express from "express";
import * as specialtyController from "../../controllers/vendor/specialty.controller";

const router = express.Router();

router.post("/", specialtyController.createSpecialty);

export default router;
