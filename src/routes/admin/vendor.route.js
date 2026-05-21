import express from "express";
import * as vendorController from "../../controllers/admin/vendor.controller";

const router = express.Router();

router.get("/", vendorController.getAllVendors);
router.get("/:id", vendorController.getVendorDetail);
router.put("/:id", vendorController.updateVendor);
router.patch("/:id/approve", vendorController.approveVendor);
router.patch("/:id/reject", vendorController.rejectVendor);

export default router;
