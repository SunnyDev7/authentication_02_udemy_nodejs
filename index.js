import express from "express";
import { eq } from "drizzle-orm";

import userRouter from "./routes/user.routes.js";
import db from "./db/index.js";
import { usersTable, userSessions } from "./db/schema.js";

const app = express();

const PORT = process.env.PORT ?? 8000;

app.use(express.json());

app.use(async function (req, res, next) {
  const sessionId = req.headers["session-id"];

  if (!sessionId) {
    return next();
  }

  const [data] = await db
    .select({
      sessionId: userSessions.id,
      id: usersTable.id,
      userId: userSessions.userId,
      name: usersTable.name,
      email: usersTable.email,
    })
    .from(userSessions)
    .rightJoin(usersTable, eq(usersTable.id, userSessions.userId))
    .where((table) => eq(table.sessionId, sessionId));

  if (!data) {
    return next();
  }

  req.user = data;
  next();
});

app.use("/user", userRouter);

app.get("/", (req, res) => {
  return res.json({ status: "Server is up and running" });
});

app.listen(PORT, () => {
  console.log(`Server up on ${PORT}`);
});
