import express from "express";
import { getUserData, login, logOut, register } from "./userController";
import { verifyJWT } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyJWT, getUserData);
router.get("/logout", logOut);

export default router;
