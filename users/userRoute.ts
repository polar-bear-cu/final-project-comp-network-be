import express from "express";
import { register } from "./userController";

const router = express.Router();

router.post("/register", register);

export default router;
