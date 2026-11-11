const { Model, DataTypes } = require("sequelize");

const { sequelize } = require("../util/db");

class Note extends Model {}

Note.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    important: {
      type: DataTypes.BOOLEAN,
      // allowNull: false enforces the rule;
      allowNull: false,
      // defaultValue: false supplies a value when one isn't provided.
      defaultValue: false,
    },
    date: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: "note",
  },
);

module.exports = Note;
