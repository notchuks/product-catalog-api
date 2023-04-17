import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import responseTime from "response-time";

import routes from "../routes";
import deserializeUser from "../middleware/deserializeUser";
import { restResponseTimeHistogram } from "./metrics";

// Rewrote app.ts so we can create express server when testing.
function createServer() {
  dotenv.config({ path: path.join(__dirname, "..", "..", "env") });

  const {
    ORIGIN
  } = process.env;

  // console.log(ORIGIN);

  const app = express();

  app.use(cors({
    origin: ORIGIN,
    credentials: true
  }))

  app.use(express.json());
  
  app.use(cookieParser());

  // middleware used on all routes. put here instead of individually for simplicity.
  app.use(deserializeUser);

  app.use(responseTime((req: Request, res: Response, time: number) => {
    if(req?.route?.path) {
      restResponseTimeHistogram.observe(
        {
          method: req.method,
          route: req.route.path,
          status_code: res.statusCode,
        },
        time * 1000  // time is in milliseconds, prometheus histogram is in seconds
      )
    }
  }))

  routes(app);

  return app;
}

export default createServer;