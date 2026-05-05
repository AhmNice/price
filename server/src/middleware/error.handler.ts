import config from "../config/config";
import {Request,Response, NextFunction} from 'express'
import { Prisma } from "../generated/prisma/client.js";
import { ZodError } from "zod";
import { formatErrorMessage } from "../utils/errorFomart";
const isProduction = config.NODE_ENV === "production";

type APIErrorOptions = {
  message: string;
  statusCode?: number;
  errors?: unknown[];
  code?: string;
};
type ErrorOptionsWithoutStatus = Omit<APIErrorOptions, "statusCode">;

export class APIError extends Error {
  public statusCode: number;
  public errors: unknown[];
  public code?: string;

  constructor({
    message,
    statusCode = 500,
    errors = [],
    code,
  }: APIErrorOptions) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}
export class NotFoundError extends APIError {
  constructor(options: ErrorOptionsWithoutStatus) {
    super({
      ...options,
      statusCode: 404,
    });
  }
}
export class BadRequestError extends APIError {
  constructor(options: ErrorOptionsWithoutStatus) {
    super({
      ...options,
      statusCode: 400,
    });
  }
}

export class UnauthorizedError extends APIError {
  constructor(options: ErrorOptionsWithoutStatus) {
    super({
      ...options,
      statusCode: 401,
    });
  }
}

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let formattedError: any = error;

  // 🔥 Prisma Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        formattedError = new BadRequestError({
          message: "Duplicate field value",
          errors: [error.meta],
          code: "DUPLICATE_FIELD",
        });
        break;

      case "P2025":
        formattedError = new NotFoundError({
          message: "Record not found",
          code: "RECORD_NOT_FOUND",
        });
        break;

      default:
        formattedError = new APIError({
          message: "Database error",
          statusCode: 500,
          errors: [error.message],
          code: "PRISMA_ERROR",
        });
    }
  }

  // 🔥 Zod Validation Errors
  else if (error instanceof ZodError) {
    const errors = error.issues.map((err) => ({
      field: err.path.join("."),
      message: formatErrorMessage(err.message),
    }));

    formattedError = new APIError({
      message: "Validation Error",
      statusCode: 422,
      errors,
      code: "VALIDATION_ERROR",
    });
  }

  // 🔥 Default fallback
  else if (!(error instanceof APIError)) {
    formattedError = new APIError({
      message: "Internal Server Error",
      statusCode: 500,
      errors: [],
      code: "INTERNAL_ERROR",
    });
  }

  // ✅ FINAL RESPONSE (THIS WAS MISSING)
  const statusCode = formattedError.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: formattedError.message,
    code: formattedError.code,
    errors: formattedError.errors || [],
  });
};
