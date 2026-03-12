import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import error from "./app/middlewares/error.middleware";
import notfound from "./app/middlewares/not-found.middleware";
import { globalRateLimiter } from "./app/middlewares/rate-limit.middleware";
import router from "./app/routes";

dotenv.config();
const app: Application = express();

app.use(globalRateLimiter);

app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api/v1", router);

app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to RBAC server!");
});

// Error handle;
app.use(error);

// Not found handle;
app.use(notfound);

export default app;
