import express from "express";
import { create } from "express-handlebars";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./src/routes/authRoutes.js";
import { connectDB } from "./src/config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configurar handlebars
const hbs = create({
  extname: ".hbs",
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "src", "views", "layouts"),
  partialsDir: path.join(__dirname, "src", "views", "partials"),

  // Helpers personalizados
  helpers: {
    eq(a, b) {
      return a === b;
    }
  }
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src", "views"));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sesiones
app.use(session({
  secret: "tu_secreto_aqui",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Rutas
app.use("/", authRoutes);

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Servidor
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
  connectDB();
});
