import { Request, Response } from "express";
import { BadRequestError } from "../middleware/error.handler";
import { AuthService } from "../service/Auth.service";
import { ApiResponse } from "../utils/ApiResponse";

export const user_register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new BadRequestError({
      message: "Email, password and name are required",
      code: "MISSING_FIELDS",
    });
  }

  try {
    const result = await AuthService.register({ email, password, name });
    return res
      .status(201)
      .json(new ApiResponse(201, result, "User registered successfully"));
  } catch (error) {
    throw error;
  }
};

export const user_login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError({
      message: "Email and password are required",
      code: "MISSING_CREDENTIALS",
    });
  }

  try {
    const user = await AuthService.login({ email, password }, res);
    return res.status(200).json(new ApiResponse(200, user, "Login successful"));
  } catch (error) {
    throw error;
  }
};
export const user_logout = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.logout(req, res);
    return res.status(200).json(new ApiResponse(200, result, "Logout successful"));
  } catch (error) {
    throw error;
  }
}