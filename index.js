import express from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import { authenticationMiddleware } from "./middlewares/auth.middleware.js";
import db from "./db/index.js";
import { usersTable, userSessions } from "./db/schema.js";

const app = express();

const PORT = process.env.PORT ?? 8000;

app.use(express.json());

app.use(authenticationMiddleware);

app.use("/user", userRouter);
app.use("/admin", adminRouter);

app.get("/", (req, res) => {
  return res.json({ status: "Server is up and running" });
});

app.listen(PORT, () => {
  console.log(`Server up on ${PORT}`);
});
