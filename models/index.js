// ./models/index.js
const Note = require("./note");
const User = require("./user");
const Team = require("./team");
const Membership = require("./membership");
const UserNotes = require("./userNotes");
const Session = require("./session");

User.hasMany(Session);
Session.belongsTo(User);

User.hasMany(Note);
Note.belongsTo(User);

// make the possible schema changes
// const syncModels = async () => {
//   await User.sync({ alter: true });
//   await Note.sync({ alter: true });
// };
User.belongsToMany(Team, { through: Membership });
Team.belongsToMany(User, { through: Membership });

User.belongsToMany(Note, { through: UserNotes, as: "markedNotes" });
Note.belongsToMany(User, { through: UserNotes, as: "usersMarked" });

module.exports = {
  Note,
  User,
  Team,
  Membership,
  UserNotes,
  Session,
};
