import { Login,SignUp } from "../controllers/AuthController.js";
import express from "express";
const AuthRouter = express.Router();

AuthRouter.post("/Login",Login)
AuthRouter.post("/SignUp",SignUp)

export default AuthRouter