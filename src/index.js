import express from "express";
import { create } from "express-handlebars";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import { sequelize, connectDB } from "./config/database.js";

import SequelizeStoreInit from "connect-session-sequelize";

const SequelizeStore = SequelizeStoreInit(session.Store);

const sessionStore = new SequelizeStore({
  db: sequelize,
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* =======================
   Handlebars
======================= */
const hbs = create({
  extname: ".hbs",
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views", "layouts"),
  partialsDir: path.join(__dirname, "views", "partials"),
  helpers: {
    eq(a, b) {
      return a === b;
    }
  }
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

/* =======================
   Middlewares
======================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

/* =======================
   Sesiones
======================= */
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: false, // Railway usa proxy HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 1 día
  }
}));

/* =======================
   Rutas
======================= */
app.use("/", authRoutes);

/* =======================
   Servidor + DB
======================= */
const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();
  sessionStore.sync();


  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
})();
