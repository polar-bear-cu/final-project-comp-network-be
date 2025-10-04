import { Request, Response } from "express";
import User from "./userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const tokenName = "sockeTalkJWTToken";

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

    const newUser = await User.create({ username, password: hashedPassword });

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
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
