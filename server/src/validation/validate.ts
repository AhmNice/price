import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validateRequest =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.flatten();

      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    req.body = result.data;
    next();
  };
