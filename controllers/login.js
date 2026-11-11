const jwt = require("jsonwebtoken");
const router = require("express").Router();

const { SECRET } = require("../util/config");
const User = require("../models/user");
const Session = require("../models/session");

router.post("/", async (request, response) => {
  const body = request.body;

  // Find the user, including disabled users
  const user = await User.unscoped().findOne({
    where: {
      username: body.username,
    },
  });

  const passwordCorrect = body.password === "secret";

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid username or password",
    });
  }

  // Prevent disabled users from logging in
  if (user.disabled) {
    return response.status(401).json({
      error: "account disabled, please contact admin",
    });
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  };

  const token = jwt.sign(userForToken, SECRET);

  // Save the active session in the database
  await Session.create({
    token,
    userId: user.id,
  });

  response.status(200).send({
    token,
    username: user.username,
    name: user.name,
  });
});

module.exports = router;

// const jwt = require("jsonwebtoken");
// const router = require("express").Router();

// const { SECRET } = require("../util/config");
// const User = require("../models/user");

// router.post("/", async (request, response) => {
//   // let's hard code the note to be attached to the first user found in the database:
//   const body = request.body;

//   const user = await User.findOne({
//     where: {
//       username: body.username,
//     },
//   });

//   const passwordCorrect = body.password === "secret";

//   if (!(user && passwordCorrect)) {
//     return response.status(401).json({
//       error: "invalid username or password",
//     });
//   }

//   //Now let's expand the controllers as follows. We prevent logging in if the user field disabled is set to true:
//   if (user.disabled) {
//     return response.status(401).json({
//       error: "account disabled, please contact admin",
//     });
//   }

//   const userForToken = {
//     username: user.username,
//     id: user.id,
//   };

//   const token = jwt.sign(userForToken, SECRET);

//   response
//     .status(200)
//     .send({ token, username: user.username, name: user.name });
// });

// module.exports = router;
