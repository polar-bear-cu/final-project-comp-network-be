import express from "express";
import { getUserData, login, register } from "./userController";
import { verifyJWT } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyJWT, getUserData);

export default router;
