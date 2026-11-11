// The role of the file index.js is to configure and launch the application:
const express = require("express");
const app = express();

const { PORT } = require("./util/config");
const { connectToDatabase } = require("./util/db");
// Let's add syncModels to the ./index.js module so that the schema is synced after we've confirmed a database connection, but before the server starts accepting requests.
// const { syncModels } = require("./models");

const notesRouter = require("./controllers/notes");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const logoutRouter = require("./controllers/logout");

app.use(express.json());

app.use("/api/notes", notesRouter);
app.use("/api/users", usersRouter);
app.use("/api/logout", logoutRouter);
app.use("/api/login", loginRouter);

const start = async () => {
  await connectToDatabase();
  // await syncModels();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
