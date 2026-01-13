import jwt from "jsonwebtoken";

export const authenticationMiddleware = async function (req, res, next) {
  try {
    //Header authorization: Bearer <token>
    const tokenHeader = req.headers["authorization"];

    if (!tokenHeader) {
      return next();
    }

    if (!tokenHeader.startsWith("Bearer")) {
      return res
        .status(400)
        .json({ error: "Authoprization header must start with Bearer" });
    }

    const token = tokenHeader.split(" ")[1];

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decode;
    next();
  } catch (err) {
    next();
  }

  //Session based middleware

  // const sessionId = req.headers["session-id"]
  // if (!sessionId) {
  //   return next();
  // }

  // const [data] = await db
  //   .select({
  //     sessionId: userSessions.id,
  //     id: usersTable.id,
  //     userId: userSessions.userId,
  //     name: usersTable.name,
  //     email: usersTable.email,
  //   })
  //   .from(userSessions)
  //   .rightJoin(usersTable, eq(usersTable.id, userSessions.userId))
  //   .where((table) => eq(table.sessionId, sessionId));

  // if (!data) {
  //   return next();
  // }

  // req.user = data;
  // next();
};

export const ensureAuthenticated = async function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "You must be authenticated" });
  }

  next();
};

export const restrictToRole = function (role) {
  return function (req, res, next) {
    if (req.user.role !== role) {
      return res
        .status(401)
        .json({ error: "You are not authorized to access this resource" });
    }

    return next();
  };
};
