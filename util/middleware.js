const jwt = require("jsonwebtoken");
const { SECRET } = require("../util/config");
const User = require("../models/user");
const Session = require("../models/session");

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get("authorization");

  if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "token missing" });
  }

  const token = authorization.substring(7);

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, SECRET);
  } catch {
    return res.status(401).json({ error: "token invalid or expired" });
  }

  // Check whether the token exists in the sessions table
  const session = await Session.findOne({
    where: { token },
  });

  if (!session) {
    return res.status(401).json({ error: "session expired or invalid" });
  }

  // Retrieve the user, including disabled users
  const user = await User.unscoped().findByPk(session.userId);

  if (!user || user.disabled || user.id !== decodedToken.id) {
    return res.status(401).json({ error: "user disabled or session invalid" });
  }

  req.decodedToken = decodedToken;
  //Why? We're saving the authenticated token on the request so the logout controller can identify exactly which session to delete.
  req.token = token;
  next();
};

const isAdmin = async (req, res, next) => {
  const user = await User.findByPk(req.decodedToken.id);

  if (!user || !user.admin) {
    return res.status(403).json({ error: "operation not allowed" });
  }

  next();
};

module.exports = { tokenExtractor, isAdmin };

// const jwt = require("jsonwebtoken");
// const { SECRET } = require("../util/config");
// const User = require("../models/user");

// const tokenExtractor = (req, res, next) => {
//   const authorization = req.get("authorization");
//   if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
//     try {
//       req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
//     } catch {
//       return res.status(401).json({ error: "token invalid" });
//     }
//   } else {
//     return res.status(401).json({ error: "token missing" });
//   }
//   next();
// };

// const isAdmin = async (req, res, next) => {
//   const user = await User.findByPk(req.decodedToken.id);
//   if (!user.admin) {
//     return res.status(401).json({ error: "operation not allowed" });
//   }
//   next();
// };

// module.exports = { tokenExtractor, isAdmin };
