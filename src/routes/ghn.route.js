import express from "express";
import * as shippingController from "../controllers/shipping.controller";

const router = express.Router();

router.get("/provinces", shippingController.getGhnProvinces);
router.get("/districts", shippingController.getGhnDistricts);
router.get("/wards", shippingController.getGhnWards);

export default router;
