import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  displayname: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "",
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bio: {
    type: DataTypes.TEXT,
  },
  mood: {
    type: DataTypes.STRING,
  },
  links: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  profilePhoto: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "default.jpg"
  }
});

