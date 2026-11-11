const router = require("express").Router();
const { tokenExtractor, isAdmin } = require("../util/middleware");
const { User, Note, Team } = require("../models");

router.get("/", async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: [""] },
    // Making a join query is very easy. Let's change the route that returns all users so that each user's notes are also shown:
    include: [
      {
        // So the join query is done using the include(opens in a new tab) option as a query parameter.
        model: Note,
        attributes: { exclude: ["userId"] },
      },
      {
        model: Note,
        as: "markedNotes",
        attributes: { exclude: ["userId"] },
        // through: {
        //   attributes: [],
        // },
      },
      {
        model: Team,
        attributes: ["name", "id"],
        // through: {
        //   attributes: ["teamId"],
        // },
      },
    ],
  });

  res.json(users);
});

router.post("/", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

// Update user details

router.put("/:id", tokenExtractor, async (req, res) => {
  // Find the user whose profile is being updated
  const user = await User.unscoped().findByPk(req.params.id);

  if (!user) {
    return res.status(404).end();
  }

  // Find the person making the request
  const loggedInUser = await User.findByPk(req.decodedToken.id);

  if (!loggedInUser) {
    return res.status(401).json({ error: "user not found" });
  }

  // Allow admins to update anyone.
  // Ordinary users can update only themselves.
  if (!loggedInUser.admin && loggedInUser.id !== user.id) {
    return res.status(403).json({
      error: "you can only update your own profile",
    });
  }

  // Only allow profile fields to be updated here.
  const updatedFields = {};

  if (req.body.name !== undefined) {
    updatedFields.name = req.body.name;
  }

  if (req.body.username !== undefined) {
    updatedFields.username = req.body.username;
  }

  await user.update(updatedFields);

  res.json(user);
});

// router.put("/:id", async (req, res) => {
//   const user = await User.findByPk(req.params.id);

//   if (user) {
//     await user.update(req.body);
//     res.json(user);
//   } else {
//     res.status(404).end();
//   }
// });

// Retrieve user details
router.get("/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: [""] },
    include: [
      {
        model: Note,
        attributes: { exclude: ["userId"] },
      },
      {
        model: Note,
        as: "markedNotes",
        attributes: { exclude: ["userId"] },
        through: {
          attributes: [],
        },
        include: {
          model: User,
          attributes: ["name"],
        },
      },
    ],
  });

  if (!user) {
    return res.status(404).end();
  }

  let teams = undefined;
  if (req.query.teams) {
    teams = await user.getTeams({
      attributes: ["name"],
      joinTableAttributes: [],
    });
  }
  res.json({ ...user.toJSON(), teams });
});
// router.get("/:id", async (req, res) => {
//   const user = await User.findByPk(req.params.id, {
//     include: {
//       model: Note,
//     },
//   });

//   if (user) {
//     res.json({
//       username: user.username,
//       name: user.name,
//       noteCount: user.notes.length,
//     });
//   } else {
//     res.status(404).end();
//   }
// });

//Let's create a route (to file controllers/users.js) that will allow an admin to change the status of a user's account:

// Admin enables/disables an account
router.put("/:username/disable", tokenExtractor, isAdmin, async (req, res) => {
  const user = await User.unscoped().findOne({
    where: {
      username: req.params.username,
    },
  });

  if (user) {
    user.disabled = req.body.disabled;
    await user.save();
    res.json(user);
  } else {
    res.status(404).end();
  }
});

console.log("Users router loaded");

module.exports = router;
