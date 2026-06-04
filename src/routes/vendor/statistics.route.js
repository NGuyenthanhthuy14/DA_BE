import express from "express";
import * as statisticsController from "../../controllers/vendor/statistics.controller";

const router = express.Router();

router.get("/dashboard", statisticsController.getDashboardStats);
router.get("/overview", statisticsController.getOverviewStats);
router.get("/revenue", statisticsController.getRevenueStats);
router.get("/top-products", statisticsController.getTopProductsStats);
router.get("/recent-orders", statisticsController.getRecentOrdersStats);

export default router;
