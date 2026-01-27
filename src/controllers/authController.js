import { User } from "../models/user.js";
import bcrypt from "bcryptjs";

export class UserController {
  // Renderiza la página de login para que el usuario pueda iniciar sesión
  static showLogin = (req, res) => {
    res.render("paginas/login");
  };

  // Renderiza la página de registro para crear una nueva cuenta de usuario
  static showRegister = (req, res) => {
    res.render("paginas/register");
  };

  // Crea un nuevo usuario en la base de datos validando datos y encriptando la contraseña
  static registerUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).render("paginas/register", {
        error: "Usuario y contraseña son obligatorios.",
        formData: { username },
      });
    }

    try {
      const existingUser = await User.findOne({ where: { username } });

      if (existingUser) {
        return res.status(409).render("paginas/register", {
          error: "El nombre de usuario ya existe.",
          formData: { username },
        });
      }

      const hashed = await bcrypt.hash(password, 10);

      await User.create({
        username,
        password: hashed,
        displayname: username,
      });

      return res.redirect("/");
    } catch (err) {
      console.log(`ERROR VERDADERO: ${err.message}`);
      console.error("Error al crear usuario:", err);

      // Manejo específico de errores de Sequelize
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).render("paginas/register", {
          error: "El nombre de usuario ya existe.",
          formData: { username },
        });
      }

      if (err.name === "SequelizeValidationError") {
        const messages = err.errors.map((e) => e.message).join(", ");
        return res.status(422).render("paginas/register", {
          error: messages,
          formData: { username },
        });
      }

      return res.status(500).render("paginas/register", {
        error: "Error interno al crear el usuario.",
        formData: { username },
      });
    }
  };

  // Inicia sesión validando usuario y contraseña y guardando los datos en la sesión
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
      links: user.links,
    };

    res.redirect("/dashboard");
  };

  // Muestra el dashboard del usuario autenticado cargando sus datos desde la base de datos
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
      links: user.links,
      profilePhoto: user.profilePhoto || "/profile/king.jpg"
    });
  };

  // Renderiza la página principal para editar el perfil del usuario
  static showFormProfile = async (req, res) => {
    const user = await User.findByPk(req.session.user.id);

    res.render("dashboard/edit-profile", {
      profilePhoto: user.profilePhoto
    });
  };

  // Renderiza dinámicamente el formulario de edición según el campo seleccionado
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
    };

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
    });
  };

  // Actualiza en la base de datos el campo editado y sincroniza los cambios con la sesión
  static Updatechanges = async (req, res) => {
    console.log("FIELD:", req.params.field);
    console.log("BODY:", req.body);

    if (!req.session.user) {
      return res.redirect("/");
    }

    const field = req.params.field;
    const userId = req.session.user.id;

    const allowedFields = ["displayname", "bio", "mood", "links", "foto"];

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

    await User.update({ [field]: newValue }, { where: { id: userId } });

    // Si cambia algo, actualizar sesión
    req.session.user[field] = newValue;

    res.redirect("/dashboard");
  };

  // Renderiza el formulario para cambiar la foto de perfil del usuario
  static ShowChangePhoto = async (req, res) => {
    res.render("dashboard/cambios/edit-photo");
  };

  static GetChangePhoto = async (req,res) => {
    if (!req.session.user) {
      return res.redirect("/auth/login");
    }
    const { photoSelected } = req.body

    const imagenes = { 
      1: "sonic.jpg",
      2: "dog.jpg",
      3: "dorfic.jpg",
      4: "linux.png",
      5: "pfp.jpg"
    }

    const selectedPhoto = imagenes[photoSelected]

    if (!selectedPhoto) {
      return res.redirect("/profile/edit/photo");
    }

    await User.update(
      { profilePhoto: selectedPhoto},
      { where: { id: req.session.user.id } }
    )
  
    req.session.user.profilePhoto = selectedPhoto;

    console.log(selectedPhoto)
    res.redirect("/dashboard")
  }
}
