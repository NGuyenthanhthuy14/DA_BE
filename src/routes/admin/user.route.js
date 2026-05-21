import express from "express";
import * as userController from "../../controllers/admin/user.controller";

const router = express.Router();

router.get("/", userController.getAllUser);
router.get("/:id", userController.getDetailUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.delete("/", userController.deleteUserAll);

export default router;
