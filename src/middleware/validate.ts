import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation failed",
          errors: error.issues.map((issue) => ({
            field: issue.path.slice(1).join("."), // removes 'body' or 'query' prefix from path
            message: issue.message,
          })),
        });
        return;
      }
      res.status(500).json({ message: "Internal server error during validation" });
    }
  };
}
