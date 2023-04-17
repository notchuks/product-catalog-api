import express from "express";
import config from "config";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import routes from "./routes";
import connect from "./utils/connect";
import logger from "./utils/logger";
// import deserializeUser from "./middleware/deserializeUser";
import createServer from "./utils/server";
import { startMetricsServer } from "./utils/metrics";
import swaggerDocs from "./utils/swagger";

const port = config.get<number>("port");

const app = createServer();

app.listen(port, async () => {
  logger.info(`App is running at http://localhost:${port}`);

  await connect();

  startMetricsServer();

  swaggerDocs(app, port);
});