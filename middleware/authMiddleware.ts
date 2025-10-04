// middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const tokenName = "sockeTalkJWTToken";

interface JwtPayload {
  id: string;
  username: string;
}

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies[tokenName];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Token not found." });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
}
