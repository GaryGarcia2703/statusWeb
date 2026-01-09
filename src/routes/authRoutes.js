import { Router } from "express";
import { UserController } from '../controllers/authController.js';
import { User } from "../models/user.js";

const router = Router();

// ruta principal
router.get('/', (req, res) => {
  res.render('paginas/home');
});

// rutas para crear cuenta
router.get('/register', UserController.showRegister);
router.post('/register', UserController.registerUser);

// rutas para realizar log-in
router.get('/login', UserController.showLogin);
router.post('/login', UserController.loginUser);

// mostrar perfil
router.get('/dashboard', UserController.showDashboard);

// rutas para editar perfil
router.get('/profile/edit' , UserController.showFormProfile)

// rutas para actualizar cambios de perfil
router.get('/profile/edit/:field', UserController.GetChangeValues )

router.post('/profile/edit/:field' , UserController.Updatechanges)

// ruta about
router.get('/about' , UserController.showAbout)

export default router;