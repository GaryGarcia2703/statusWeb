import { User } from "../models/user.js";
import bcrypt from "bcryptjs";

export class UserController {
  // Mostrar login
  static showLogin = (req, res) => {
    res.render("paginas/login");
  };

  // Mostrar registro (crear nueva cuenta)
  static showRegister = (req, res) => {
    res.render("paginas/register");
  };

  // Crear usuario
  static registerUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .render("paginas/register", {
          error: "Usuario y contraseña son obligatorios.",
          formData: { username },
        });
    }

    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      return res.status(409).render("paginas/register", {
        error: "El nombre de usuario ya existe.",
        formData: { username },
      });
    }

    try {
      const hashed = await bcrypt.hash(password, 10);

      await User.create({
        username,
        password: hashed,
        displayname: username,
      });

      return res.redirect("/");
    } catch (err) {
      console.error("Error al crear usuario:", err);

      // Manejo específico de errores de Sequelize
      if (err.name === "SequelizeUniqueConstraintError") {
        return res
          .status(409)
          .render("paginas/register", {
            error: "El nombre de usuario ya existe.",
            formData: { username },
          });
      }

      if (err.name === "SequelizeValidationError") {
        const messages = err.errors.map((e) => e.message).join(", ");
        return res
          .status(422)
          .render("paginas/register", {
            error: messages,
            formData: { username },
          });
      }

      return res
        .status(500)
        .render("paginas/register", {
          error: "Error interno al crear el usuario.",
          formData: { username },
        });
    }
  };

  // Iniciar sesión
  static loginUser = async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.render("paginas/login", {
        error: "Usuario no encontrado",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.render("paginas/login", {
        error: "Contraseña incorrecta",
      });
    }

    req.session.user = { 
        id: user.id,
        username: user.username,
        displayname: user.displayname,
        mood: user.mood,
        bio: user.bio,
        links: user.links
    };

    res.redirect("/dashboard");
  };

  // mostrar dashboard
  static showDashboard = async (req, res) => {
    if (!req.session.user) {
      return res.redirect("/");
    }

    const user = await User.findByPk(req.session.user.id);

    if (!user) {
      req.session.destroy();
      return res.redirect("/");
    }

    res.render("dashboard/dashboard", {
      username: user.username,
      displayname: user.displayname,
      mood: user.mood,
      bio: user.bio,
      links: user.links
    });
  };

  // editar perfil
  static showFormProfile = async (req, res) => {
    res.render("dashboard/edit-profile");
  };

  static GetChangeValues = async (req, res) => {
    const field = req.params.field;

    const config = {
      displayname: {
        title: "Cambiar nombre de perfil",
        inputType: "text",
        name: "displayname",
        placeholder: "Informe el nombre que desea",
      },
      bio: {
        title: "Cambiar bio",
        inputType: "textarea",
        name: "bio",
        placeholder: "Informe su nueva bio",
      },
      mood: {
        title: "Cambiar mood",
        inputType: "text",
        name: "mood",
        placeholder: "Informe como se siente",
      },
      links: {
        title: "Cambiar links",
        isLinks: true, 
        placeholder: "https://web.com/",
      },
    }

    const fieldConfig = config[field];

    if (!fieldConfig) {
      return res.redirect("/");
    }

    res.render("dashboard/cambios/edit-field", {
        field,
        title: fieldConfig.title,
        inputType: fieldConfig.inputType,
        name: fieldConfig.name,
        placeholder: fieldConfig.placeholder,
        isLinks: fieldConfig.isLinks ?? false,
    })
  }

  static Updatechanges = async (req, res) => {

    console.log("FIELD:", req.params.field);
    console.log("BODY:", req.body);
  
      if (!req.session.user) {
        return res.redirect("/");
      }

      const field = req.params.field; 
      const userId = req.session.user.id;

      const allowedFields = ["displayname", "bio", "mood", "links"];

      if (!allowedFields.includes(field)) {
        return res.status(400).send("Campo no permitido para actualizar.");
      }

      let newValue;

      if (field === "links") {
        newValue = {
          instagram: req.body.instagram || null,
          spotify: req.body.spotify || null,
          pinterest: req.body.pinterest || null,
        };

      } else {
        newValue = req.body[field]; 
      }

      
      await User.update(
        { [field]: newValue },
        { where: { id: userId } }
      );

      // Si cambia algo, actualizar sesión
      req.session.user[field] = newValue;

  res.redirect("/dashboard");
};
}
