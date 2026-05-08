import cors from "cors";
import express from "express";
import type { Request, Response } from "express";
import { ZodError } from "zod";

import { SolverError, solveWithGemini } from "./gemini.js";
import type { DoubtSolver } from "./types.js";
import { solveRequestSchema } from "./validation.js";

interface AppOptions {
  solver?: DoubtSolver;
}

function sendError(response: Response, status: number, error: string, details?: unknown) {
  response.status(status).json({ error, details });
}

export function createApp(options: AppOptions = {}) {
  const app = express();
  const solver = options.solver ?? solveWithGemini;

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_request: Request, response: Response) => {
    response.json({
      status: "ok",
      app: "DoubtDesk",
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/solve-doubt", async (request: Request, response: Response) => {
    try {
      const input = solveRequestSchema.parse(request.body);
      const solution = await solver(input);
      response.json(solution);
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(
          response,
          400,
          "Invalid request",
          error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        );
        return;
      }

      if (error instanceof SolverError) {
        sendError(response, error.statusCode, error.message);
        return;
      }

      sendError(response, 500, "Something went wrong while solving this doubt.");
    }
  });

  return app;
}
