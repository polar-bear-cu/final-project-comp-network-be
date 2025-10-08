import { Request, Response } from "express";
import User from "./userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { tokenName } from "../middleware/authMiddleware";
import { checkFormValidation } from "../utils/function";
import { Types } from "mongoose";

export interface FormDataInterface {
  username: string;
  password: string;
}

export interface FormResultInterface {
  pass: boolean;
  message: string;
}

export interface UserInterface {
  userid: Types.ObjectId;
  username: string;
}

export async function register(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    const formResult = checkFormValidation({ username, password });

    if (!formResult.pass) {
      res.status(400).json({
        success: false,
        message: formResult.message,
      });
    }

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

    existingUser.lastLoginAt = new Date();
    await existingUser.save();

    const userObject: UserInterface = {
      userid: existingUser._id,
      username: existingUser.username,
    };

    const token = jwt.sign(userObject, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });

    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      secure: false,
    };

    res
      .status(201)
      .cookie(tokenName, token, cookieOptions)
      .json({
        success: true,
        message: "User signed in successfully",
        user: {
          id: existingUser._id,
          username: existingUser.username,
          lastLoginAt: existingUser.lastLoginAt,
        },
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

export async function logOut(req: Request, res: Response) {
  try {
    res
      .clearCookie(tokenName, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
      })
      .status(200)
      .json({
        success: true,
        message: "User logged out successfully",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while logging out.",
    });
  }
}

export async function addFriend(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { friendUsername } = req.body;

    if (!friendUsername) {
      return res
        .status(400)
        .json({ success: false, message: "Friend username is required." });
    }

    const friendUser = await User.findOne({ username: friendUsername });

    if (!friendUser) {
      return res
        .status(404)
        .json({ success: false, message: "Friend user not found." });
    }

    if (friendUser._id.equals(user.userid)) {
      return res.status(400).json({
        success: false,
        message: "You can't add yourself as a friend.",
      });
    }

    const alreadyFriend = user.friendList.some((id: Types.ObjectId) => {
      return id == friendUser._id;
    });

    if (alreadyFriend) {
      return res.status(400).json({
        success: false,
        message: "This user is already in your friend list.",
      });
    }

    user.friendList.push(friendUser._id);
    friendUser.friendList.push(user._id);

    await Promise.all([user.save(), friendUser.save()]);

    return res.status(200).json({
      success: true,
      message: `You are now friends with ${friendUser.username}!`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while adding friend.",
    });
  }
}
