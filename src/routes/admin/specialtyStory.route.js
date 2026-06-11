import express from "express";
import * as specialtyStoryController from "../../controllers/admin/specialtyStory.controller";

const router = express.Router();

router.get("/", specialtyStoryController.getAllSpecialtyStories);
router.get("/:id", specialtyStoryController.getSpecialtyStoryById);
router.post("/", specialtyStoryController.createSpecialtyStory);
router.put("/:id", specialtyStoryController.updateSpecialtyStory);
router.patch("/:id/publish", specialtyStoryController.publishSpecialtyStory);
router.patch("/:id/archive", specialtyStoryController.archiveSpecialtyStory);
router.delete("/:id", specialtyStoryController.deleteSpecialtyStory);

export default router;
