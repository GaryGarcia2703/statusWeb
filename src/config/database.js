
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new error ("DATABASES_URL nao foi definida no .env")
}

const requiredVars = [
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "DB_HOST",
];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Variável de ambiente ausente: ${key}`);
  }
}

export const sequelize = new Sequelize(
  process.env.DATABASE_URL,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

console.log("DB diagnostic:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  passwordDefined: Boolean(process.env.DB_PASSWORD),
  passwordLength: process.env.DB_PASSWORD?.length,
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    await sequelize.sync();

    console.log("Models synchronized.");
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
};
