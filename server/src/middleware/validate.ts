import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema, ZodError, z } from "zod";
import { AppError } from "../errors/AppError";

// Narrows req.body to the Zod inferred type.
// The returned RequestHandler carries the inferred type so controllers
// typed with Request<?, ?, z.infer<S>> get full type safety.
export const validateBody =
  <S extends ZodSchema>(schema: S): RequestHandler<any, any, z.infer<S>> =>
  (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(zodToAppError(err));
    }
  };

// Narrows req.params — returned handler types params as z.infer<S>
export const validateParams =
  <S extends ZodSchema>(schema: S): RequestHandler<z.infer<S>> =>
  (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (err) {
      next(zodToAppError(err));
    }
  };

// Narrows req.query — returned handler types query as z.infer<S>
export const validateQuery =
  <S extends ZodSchema>(schema: S): RequestHandler<any, any, any, z.infer<S>> =>
  (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      next(zodToAppError(err));
    }
  };

// Shared error conversion — keeps each validator DRY
const zodToAppError = (err: unknown): AppError | unknown => {
  if (err instanceof ZodError) {
    const message = err.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    return new AppError(400, message);
  }
  return err;
};
