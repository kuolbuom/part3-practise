// The route handling associated with notes can be found in the file controllers/notes.js:
const router = require("express").Router();

const { Note, User } = require("../models");

const { tokenExtractor } = require("../util/middleware");

const { Op } = require("sequelize");

router.get("/", async (req, res) => {
  console.log("Query parameter:", req.query.important);

  // let important = { [Op.in]: [true, false] };

  // if (req.query.important === "true") {
  //   important = true;
  // } else if (req.query.important === "false") {
  //   important = false;
  // }

  const where = {};

  //checks the request impotance true or false
  if (req.query.important === "true") {
    where.important = true;
  } else if (req.query.important === "false") {
    where.important = false;
  }

  //search the the content by word
  if (req.query.search) {
    where.content = {
      [Op.substring]: req.query.search,
    };
  }

  console.log("Database filter:", where);

  const notes = await Note.findAll({
    attributes: { exclude: ["userId"] },
    include: {
      model: User,
      attributes: ["name"],
    },
    where,
  });
  res.json(notes);
});

router.post("/", tokenExtractor, async (req, res) => {
  try {
    //  let's hard code the note to be attached to the first user found in the database:
    const user = await User.findOne();
    const note = await Note.create({
      ...req.body,
      date: new Date(),
      userId: user.id,
      // Pay attention to how there is now a user_id column in the notes in the database. The corresponding object in each database row is referred to by Sequelize's naming convention, in camel case userId.
    });
    res.json(note);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

const noteFinder = async (req, res, next) => {
  req.note = await Note.findByPk(req.params.id);
  if (!req.note) {
    return res.status(404).end();
  }
  next();
};

router.get("/:id", tokenExtractor, noteFinder, async (req, res) => {
  res.json(req.note);
});

router.put("/:id", tokenExtractor, noteFinder, async (req, res) => {
  req.note.important = req.body.important;
  await req.note.save();
  res.json(req.note);
});

router.delete("/:id", tokenExtractor, noteFinder, async (req, res) => {
  await req.note.destroy();
  res.status(204).end();
});

module.exports = router;
