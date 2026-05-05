import prisma from "../config/database";
import { APIError } from "../middleware/error.handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import config from "../config/config.js";
import { UnauthorizedError } from "../middleware/error.handler.js";
import { SessionPayload } from "../interface/session.js";

type AuthInput = {
  email: string;
  password: string;
  name?: string;
};

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export class AuthService {
  private static readonly refreshTokenExpiresIn =
    "7d" as jwt.SignOptions["expiresIn"];

  private static getCookieOptions() {
    return {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
    };
  }

  private static buildSessionPayload(user: AuthUser): SessionPayload {
    return {
      userId: user.id,
      email: user.email,
      userName: user.name ?? user.email,
      role: user.role,
    };
  }

  private static async persistRefreshToken(
    userId: string,
    refreshToken: string,
  ) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await prisma.sessionToken.create({
      data: {
        userId,
        refreshToken: hashedToken,
        expiresAt,
      },
    });
  }

  private static async revokeRefreshToken(refreshToken: string): Promise<void> {
    let decoded: SessionPayload;
    try {
      decoded = jwt.verify(
        refreshToken,
        config.JWT_SECRET as string,
      ) as SessionPayload;
    } catch {
      return;
    }

    const sessions = await prisma.sessionToken.findMany({
      where: {
        userId: decoded.userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        refreshToken: true,
      },
    });

    for (const session of sessions) {
      const isMatch = await bcrypt.compare(refreshToken, session.refreshToken);
      if (isMatch) {
        await prisma.sessionToken.deleteMany({
          where: {
            refreshToken: session.refreshToken,
          },
        });
        break;
      }
    }
  }

  static async register({ email, password, name }: AuthInput) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new APIError({
        message: "User with this email already exists",
        statusCode: 400,
        code: "USER_EXISTS",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      await prisma.user.create({
        data: {
          email,
          password: passwordHash,
          name,
        },
      });

      return {
        status: "success",
        message: "User registered successfully",
      };
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError({
        message: "Failed to register user",
        statusCode: 500,
        code: "USER_REGISTRATION_FAILED",
      });
    }
  }

  static async login(
    { email, password }: Pick<AuthInput, "email" | "password">,
    res: Response,
  ) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedError({
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    console.log("Password match result:", passwordMatches);
    if (!passwordMatches) {
      throw new UnauthorizedError({
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      });
    }

    const payload = this.buildSessionPayload(user);
    const accessToken = jwt.sign(payload, config.JWT_SECRET as string, {
      expiresIn: (config.JWT_EXPIRES_IN ||
        "15m") as jwt.SignOptions["expiresIn"],
    });
    const refreshToken = jwt.sign(payload, config.JWT_SECRET as string, {
      expiresIn: this.refreshTokenExpiresIn,
    });

    await this.persistRefreshToken(user.id, refreshToken);

    const cookieOptions = this.getCookieOptions();
    res.cookie(
      config.SESSION_COOKIE_NAME_ACCESS as string,
      accessToken,
      cookieOptions,
    );
    res.cookie(
      config.SESSION_COOKIE_NAME_REFRESH as string,
      refreshToken,
      cookieOptions,
    );

    return {
      status: "success",
      message: "User logged in successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role:user.role,
      },
    };
  }

  static async logout(req: Request, res: Response) {
    const refreshToken =
      req.cookies?.[config.SESSION_COOKIE_NAME_REFRESH as string];

    if (refreshToken) {
      await this.revokeRefreshToken(refreshToken);
    }

    const cookieOptions = this.getCookieOptions();
    res.clearCookie(config.SESSION_COOKIE_NAME_ACCESS as string, cookieOptions);
    res.clearCookie(
      config.SESSION_COOKIE_NAME_REFRESH as string,
      cookieOptions,
    );

    return {
      status: "success",
      message: "User logged out successfully",
    };
  }
}
