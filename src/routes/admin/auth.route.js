import express from "express";
import { login, logout, refreshToken } from "../../controllers/admin/auth.controller";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

export default router;
