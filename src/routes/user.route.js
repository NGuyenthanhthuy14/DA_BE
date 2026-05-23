import express from "express";
import * as userController from "../controllers/user.controller";
import { verifyUser } from "../middleware/verifyRole";

const router = express.Router();

router.get("/profile", verifyUser, userController.getProfile);
router.put("/profile", verifyUser, userController.updateProfile);
router.patch("/profile", verifyUser, userController.updateProfile);
router.get("/addresses", verifyUser, userController.getAddressBook);
router.post("/addresses", verifyUser, userController.addAddressBook);
router.put("/addresses/:addressId", verifyUser, userController.updateAddressBook);
router.patch("/addresses/:addressId", verifyUser, userController.updateAddressBook);
router.delete("/addresses/:addressId", verifyUser, userController.deleteAddressBook);
router.get("/favorite-shops", verifyUser, userController.getFavoriteShops);
router.post("/favorite-shops/:shopId", verifyUser, userController.addFavoriteShop);
router.delete("/favorite-shops/:shopId", verifyUser, userController.removeFavoriteShop);
router.get("/product-reviews", verifyUser, userController.getMyProductReviews);
router.post("/product-reviews", verifyUser, userController.createProductReview);

export default router;
