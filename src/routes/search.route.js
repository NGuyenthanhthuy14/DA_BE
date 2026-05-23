import express from "express";
import * as searchController from "../controllers/search.controller";

const router = express.Router();

router.get("/", searchController.searchAll);
router.get("/shops", searchController.searchShops);

export default router;
