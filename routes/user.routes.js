import express from "express";
import { eq } from "drizzle-orm";
import { randomBytes, createHmac } from "node:crypto";
import jwt from "jsonwebtoken";

import db from "../db/index.js";
import { usersTable, userSessions } from "../db/schema.js";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.patch("/", ensureAuthenticated, async (req, res) => {
  const { name } = req.body;

  await db.update(usersTable).set({ name }).where(eq(usersTable.id, user.id));

  return res.json({ status: "success" });
});

router.get("/", ensureAuthenticated, async (req, res) => {
  return res.json({ user });
}); //show to logged in user

router.post("/signup", async function (req, res) {
  const { name, email, password } = req.body;

  const [existingUser] = await db
    .select({
      email: usersTable.email,
    })
    .from(usersTable)
    .where((table) => eq(table.email, email));

  if (existingUser) {
    return res.status(400).json({ error: "User with email already exists" });
  }

  const salt = randomBytes(256).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  const [user] = await db
    .insert(usersTable)
    .values({
      name,
      email,
      password: hashedPassword,
      salt,
    })
    .returning({ id: usersTable.id });

  return res
    .status(201)
    .json({ status: "Success!", data: { userId: user.id } });
});

router.post("/login", async function (req, res) {
  const { email, password } = req.body;

  const [existingUser] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      salt: usersTable.salt,
      role: usersTable.role,
      password: usersTable.password,
    })
    .from(usersTable)
    .where((table) => eq(table.email, email));

  if (!existingUser) {
    return res.status(404).json({ error: "User with email does not exists" });
  }

  const salt = existingUser.salt;
  const existingHash = existingUser.password;

  const newHash = createHmac("sha256", salt).update(password).digest("hex");

  if (newHash !== existingHash) {
    return res.status(400).json({ erro: "Incorrect Password" });
  }

  //generate a session for the user and return success
  // const [session] = await db
  //   .insert(userSessions)
  //   .values({ userId: existingUser.id })
  //   .returning({
  //     id: userSessions.id,
  //   });

  // return res.json({ status: "success!", sessionId: session.id });

  const payload = {
    id: existingUser.id,
    email: existingUser.email,
    name: existingUser.name,
    role: existingUser.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1m" });

  return res.json({ status: "success!", token });
});

export default router;
