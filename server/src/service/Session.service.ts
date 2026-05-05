import config from "../config/config.js";
import jwt from "jsonwebtoken";

import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../middleware/error.handler.js";
import bcrypt from "bcrypt";
import {UserService} from './User.service.js';
import prisma from "../config/database.js";
import { SessionPayload } from "../interface/session.js";

interface StoredRefreshToken {
  refreshToken: string;
  user_id: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: SessionPayload;
  }
}

export class Session {
  constructor(private payload: SessionPayload) {
    Object.assign(this.payload);
  }
  private refreshToken: string = "";
  async saveSession(user_id: string) {
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const hashedToken = await bcrypt.hash(this.refreshToken, 10);
      const result = await prisma.sessionToken.create({
        data: {
          userId: user_id,
          refreshToken: hashedToken,
          expiresAt,
        },
      });
      if (!result) {
        throw new Error("Failed to save session token");
      }
    } catch (error) {
      throw new Error(
        "Error saving session token: " + (error as Error).message,
      );
    }
  }
  async getSessionRefreshToken({
    token,
    user_id,
  }: {
    token: string;
    user_id: string;
  }): Promise<StoredRefreshToken | null> {
    try {
      const result = await prisma.sessionToken.findMany({
        where: {
          userId: user_id,
          expiresAt: {
            gt: new Date(),
          },
        },
        select: {
          refreshToken: true,
          userId: true,
        },
      });
      if (!result.length) return null;

      for (const row of result) {
        const isMatch = await bcrypt.compare(token, row.refreshToken);
        if (isMatch)
          return { refreshToken: row.refreshToken, user_id: row.userId };
      }
      return null;
    } catch (error) {
      throw new Error(
        "Error retrieving session token: " + (error as Error).message,
      );
    }
  }
  async createSession(res: Response): Promise<void> {
    const accessTokenExpiresIn =
      (config.JWT_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"];
    const refreshTokenExpiresIn = "7d" as jwt.SignOptions["expiresIn"];

    const accessToken = jwt.sign(this.payload, config.JWT_SECRET as string, {
      expiresIn: accessTokenExpiresIn,
    });
    const refreshToken = jwt.sign(this.payload, config.JWT_SECRET as string, {
      expiresIn: refreshTokenExpiresIn,
    });
    this.refreshToken = refreshToken;
    await this.saveSession(this.payload.userId);

    res.cookie(config.SESSION_COOKIE_NAME_REFRESH as string, refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.cookie(`${config.SESSION_COOKIE_NAME_ACCESS as string}`, accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
    });
  }
  private async automaticRefresh(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies[`${config.SESSION_COOKIE_NAME_REFRESH}`];
    if (!refreshToken) {
      throw new UnauthorizedError({ message: "No refresh token provided" });
    }

    let decodedRefresh: SessionPayload;
    try {
      decodedRefresh = jwt.verify(
        refreshToken,
        config.JWT_SECRET as string,
      ) as SessionPayload;
    } catch {
      throw new UnauthorizedError({ message: "Invalid refresh token" });
    }

    req.user = decodedRefresh;
    const storedRefreshToken = await this.getSessionRefreshToken({
      token: refreshToken,
      user_id: req.user.userId,
    });
    if (!storedRefreshToken || !storedRefreshToken.refreshToken) {
      throw new UnauthorizedError({ message: "Invalid refresh token" });
    }

    const user = await UserService.findById(`${storedRefreshToken.user_id}`);
    if (!user) {
      throw new UnauthorizedError({ message: "User not found" });
    }
    if (!user.id || !user.name || !user.email ) {
      throw new UnauthorizedError({ message: "User data is incomplete" });
    }

    await prisma.sessionToken.deleteMany({
      where: {
        userId: user.id,
        refreshToken: storedRefreshToken.refreshToken,
      },
    });

    const userInfo: SessionPayload = {
      userId: user.id,
      userName: user.name,
      email: user.email,
      role: "user",
    };

    const newAccessTokenExpiresIn =
      (config.JWT_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"];
    const newRefreshTokenExpiresIn = "7d" as jwt.SignOptions["expiresIn"];

    const newAccessToken = jwt.sign(userInfo, config.JWT_SECRET as string, {
      expiresIn: newAccessTokenExpiresIn,
    });
    const newRefreshToken = jwt.sign(userInfo, config.JWT_SECRET as string, {
      expiresIn: newRefreshTokenExpiresIn,
    });

    this.refreshToken = newRefreshToken;
    await this.saveSession(user.id);

    res.cookie(`${config.SESSION_COOKIE_NAME_REFRESH}`, newRefreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.cookie(`${config.SESSION_COOKIE_NAME_ACCESS}`, newAccessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
    });

    req.user = userInfo;
  }
  async verifySession(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies[`${config.SESSION_COOKIE_NAME_ACCESS}`];
    if (!token) {
      throw new UnauthorizedError({ message: "No session token provided" });
    }
    try {
      const decoded = jwt.verify(
        token,
        config.JWT_SECRET as string,
      ) as SessionPayload;
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        await this.automaticRefresh(req, res);
        next();
      } else {
        throw new UnauthorizedError({ message: "Invalid session token" });
      }
    }
  }
  private async deleteSession(refreshToken: string): Promise<void> {
    try {
      await prisma.sessionToken.delete({
        where: {
          refreshToken,
        },
      });
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  }
  async destroySession(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies[`${config.SESSION_COOKIE_NAME_REFRESH}`];
    if (refreshToken) {
      const result = await prisma.sessionToken.findMany({
        where: {
          userId: req.user?.userId,
        },
        select: {
          refreshToken: true,
        },
      });
      if (result.length) {
        for (const row of result) {
          const isMatch = await bcrypt.compare(refreshToken, row.refreshToken);
          if (isMatch) {
            await this.deleteSession(row.refreshToken);
            break;
          }
        }
      }
    }
    res.clearCookie(`${config.SESSION_COOKIE_NAME_ACCESS}`);
    res.clearCookie(`${config.SESSION_COOKIE_NAME_REFRESH}`);
  }
  static verifyToken(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        config.JWT_SECRET as string,
      ) as SessionPayload;
      return decoded;
    } catch (error) {
      throw error;
    }
  }
  static extractTokenFromCookie(
    cookie: string | Record<string, string> | undefined,
  ): string | null {
    if (!cookie) return null;

    if (typeof cookie === "string") {
      const tokenPair = cookie
        .split(";")
        .map((value) => value.trim())
        .find((value) =>
          value.startsWith(`${config.SESSION_COOKIE_NAME_ACCESS}=`),
        );

      if (!tokenPair) return null;
      const [, token = ""] = tokenPair.split("=");
      return token ? decodeURIComponent(token) : null;
    }

    return cookie[`${config.SESSION_COOKIE_NAME_ACCESS}`] ?? null;
  }
}
