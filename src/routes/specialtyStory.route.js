import express from "express";
import * as specialtyStoryController from "../controllers/specialtyStory.controller";

const router = express.Router();

router.get("/nearby", specialtyStoryController.getNearbyPublishedStories);
router.get("/:slug", specialtyStoryController.getPublishedStoryBySlug);

export default router;
