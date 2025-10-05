import { Request, Response } from "express";
import User from "./userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { tokenName } from "../middleware/authMiddleware";

export async function register(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Username has already been taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });

    res.status(201).json({
      success: true,
      message: "User is created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "There's something wrong. Please try again!",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Username doesn't exist." });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Username and password don't match.",
      });
    }

    const token = jwt.sign(
      { userid: existingUser._id, username: existingUser.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      secure: true,
    };

    res.status(201).cookie(tokenName, token, cookieOptions).json({
      success: true,
      message: "User sign in successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "There's something wrong. Please try again!",
    });
  }
}

export async function getUserData(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    res.status(200).json({
      success: true,
      message: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "There's something wrong. Please try again!",
    });
  }
}
